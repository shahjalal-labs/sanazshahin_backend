import * as cheerio from "cheerio";
import axios from "axios";
import ApiError from "../errors/ApiErrors";

export interface ScrapedRecipeCard {
  title: string;
  image: string;
  link: string;
  category?: string;
  features: string[];
}

export interface ScrapedRecipeDetails extends ScrapedRecipeCard {
  description?: string;
  images?: string[];
  ingredients: string[];
  equipments: string[];
  instructions: string[];
  notes: string[];
  tips: string[];
  storage: string[];
  swaps: string[];
  nutrition?: string;
  videoUrl?: string;
}

const BASE_URL = "https://www.tomatoeswithlemon.com";
const scrapedRecipesSourceUrl =
  process.env.SCRAPED_RECIPES_SOURCE_URL ??
  "https://www.tomatoeswithlemon.com/recipe";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const slugifyText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toAbsoluteUrl = (href?: string | null) => {
  if (!href) {
    return "";
  }

  return new URL(href, BASE_URL).toString();
};

export const getPageRecipes = ($: cheerio.CheerioAPI): ScrapedRecipeCard[] => {
  const recipes: ScrapedRecipeCard[] = [];

  $(".recipes_item").each((_, element) => {
    const card = $(element);
    const title = card.find(".recipes_name").text().trim();
    const image =
      card.find("img").attr("src") || card.find("img").attr("data-src") || "";
    const link = toAbsoluteUrl(card.find("a.recipes_link").attr("href"));
    const category = card
      .find('[fs-cmsfilter-field="type"]')
      .first()
      .text()
      .trim();
    const features = card
      .find('[fs-cmsfilter-field="feature"]')
      .map((_, feature) => $(feature).text().trim())
      .get()
      .filter(Boolean);

    if (title && image && link) {
      recipes.push({
        title,
        image,
        link,
        category,
        features,
      });
    }
  });

  return recipes;
};

export const getPaginationUrls = (
  $: cheerio.CheerioAPI,
  currentPageUrl: string,
): string[] => {
  const urls = new Set<string>();

  $("a[href*='page=']").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) {
      return;
    }

    try {
      const nextUrl = new URL(href, currentPageUrl).toString();
      if (nextUrl !== currentPageUrl) {
        urls.add(nextUrl);
      }
    } catch {
      return;
    }
  });

  return Array.from(urls);
};

export const scrapeRecipes = async (): Promise<ScrapedRecipeCard[]> => {
  const recipesByLink = new Map<string, ScrapedRecipeCard>();
  const visitedPages = new Set<string>();
  const pageQueue: string[] = [scrapedRecipesSourceUrl];

  while (pageQueue.length > 0) {
    const currentPageUrl = pageQueue.shift();
    if (!currentPageUrl || visitedPages.has(currentPageUrl)) {
      continue;
    }

    visitedPages.add(currentPageUrl);

    const response = await axios.get(currentPageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(response.data);
    const pageRecipes = getPageRecipes($);

    for (const recipe of pageRecipes) {
      recipesByLink.set(recipe.link, recipe);
    }

    const paginationUrls = getPaginationUrls($, currentPageUrl);
    for (const paginationUrl of paginationUrls) {
      if (!visitedPages.has(paginationUrl)) {
        pageQueue.push(paginationUrl);
      }
    }
  }

  return Array.from(recipesByLink.values());
};

export const findRecipeCardByName = async (name: string) => {
  const targetName = normalizeText(name);
  const targetSlug = slugifyText(name);
  const recipes = await scrapeRecipes();

  const recipeCard = recipes.find((recipe) => {
    const recipeTitle = normalizeText(recipe.title);
    const recipeSlug = slugifyText(recipe.title);

    return recipeTitle === targetName || recipeSlug === targetSlug;
  });

  if (!recipeCard) {
    throw new ApiError(404, "Scraped recipe not found.");
  }

  return recipeCard;
};

export const findHeadingElement = ($: cheerio.CheerioAPI, label: string) => {
  const targetLabel = normalizeText(label);
  const aliases: Record<string, string[]> = {
    ingredients: ["ingredients"],
    equipments: ["equipment", "equipments"],
    equipment: ["equipment", "equipments"],
    instructions: ["instructions", "instruction"],
    notes: ["notes", "note"],
    tips: ["tips", "tip"],
    storage: ["storage"],
    swaps: ["swaps", "swap"],
    description: ["description"],
    nutrition: ["nutrition"],
  };

  const labelAliases = aliases[targetLabel] ?? [targetLabel];

  return $("h1, h2, h3, h4, h5, h6, p, div")
    .filter((_, element) => {
      const el = $(element);
      if (el.parents("script, style, head").length) {
        return false;
      }

      const text = el.text().replace(/\s+/g, " ").trim();
      if (!text || text.length > 120) {
        return false;
      }

      const normalizedText = text
        .toLowerCase()
        .replace(/[:.]+$/, "")
        .replace(/&/g, "and")
        .replace(/\s+/g, " ")
        .trim();

      return labelAliases.some(
        (alias) =>
          normalizedText === alias ||
          normalizedText.startsWith(`${alias}:`) ||
          normalizedText.startsWith(`${alias} `),
      );
    })
    .first();
};

export const extractSectionItems = ($: cheerio.CheerioAPI, label: string) => {
  const normalizedLabel = normalizeText(label);

  if (normalizedLabel === "ingredients") {
    const ingredients = $(
      ".recipe-header_ingredient_column .text-rich-text-recipe li",
    );
    if (ingredients.length) {
      return ingredients
        .map((_, element) => $(element).text().trim())
        .get()
        .filter(Boolean);
    }
  }

  if (normalizedLabel === "equipments" || normalizedLabel === "equipment") {
    const equipments = $(
      ".recipe-header_ingredient_column .text-rich-text-recipe li",
    )
      .map((_, element) => $(element).text().trim())
      .get()
      .filter(Boolean);

    if (equipments.length) {
      return equipments;
    }
  }

  if (normalizedLabel === "instructions") {
    const instructions = $(
      ".text-rich-text-instructions.w-richtext li, .print_instructions .text-rich-text-print li",
    );
    if (instructions.length) {
      const items = instructions
        .map((_, element) => $(element).text().trim())
        .get()
        .filter(Boolean)
        .filter(
          (item) => !/Common Mistakes|Storage:|Swaps:|Tips:|Notes:/i.test(item),
        );

      if (items.length) {
        return [...new Map(items.map((item) => [item, item])).values()];
      }
    }
  }

  if (["notes", "tips", "storage", "swaps"].includes(normalizedLabel)) {
    const paragraphs = $(
      ".faq_wrapper .text-rich-text-instructions.notes-section p",
    );
    const textItems = paragraphs
      .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
      .get()
      .filter(Boolean);

    if (!textItems.length) {
      return [];
    }

    const matcherMap: Record<string, RegExp> = {
      notes: /common mistakes|notes/i,
      tips: /tips?/i,
      storage: /storage/i,
      swaps: /swaps?/i,
    };

    const matcher = matcherMap[normalizedLabel];

    if (!matcher) {
      return textItems
        .map((item) => item.replace(/^[^:]+:\s*/, ""))
        .filter(Boolean);
    }

    return textItems
      .filter((item) => matcher.test(item))
      .map((item) => item.replace(/^[^:]+:\s*/, ""))
      .filter(Boolean);
  }

  if (normalizedLabel === "nutrition") {
    const nutrition = $(".recipe-nutrition_wrapper .text-rich-text");
    if (nutrition.length) {
      return nutrition
        .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
        .get()
        .filter(Boolean);
    }
  }

  const heading = findHeadingElement($, label);
  if (!heading.length) {
    return [];
  }

  const candidateList = heading
    .nextAll("ol, ul")
    .filter((_, element) => $(element).find("li").length > 0)
    .first();

  if (candidateList.length) {
    return candidateList
      .find("li")
      .map((_, element) => $(element).text().trim())
      .get()
      .filter(Boolean);
  }

  const sectionText = heading
    .nextUntil("h1, h2, h3, h4, h5, h6")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return sectionText
    ? sectionText
        .split(/\s{2,}|\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
};

export const extractImageUrls = ($: cheerio.CheerioAPI): string[] => {
  const urls = new Set<string>();

  $("img").each((_, element) => {
    const src =
      $(element).attr("src") ||
      $(element).attr("data-src") ||
      $(element).attr("data-lazy-src") ||
      $(element).attr("srcset")?.split(/\s+/)[0] ||
      "";

    if (!src) {
      return;
    }

    const absoluteUrl = src.startsWith("//")
      ? `https:${src}`
      : src.startsWith("http")
        ? src
        : new URL(src, BASE_URL).toString();

    urls.add(absoluteUrl);
  });

  return Array.from(urls).filter((url) => {
    const normalizedUrl = url.toLowerCase();

    if (normalizedUrl.includes("social") || normalizedUrl.includes("logo")) {
      return false;
    }

    return /\.(jpe?g|png)(?:[?#].*)?$/i.test(normalizedUrl);
  });
};

export const extractSectionText = ($: cheerio.CheerioAPI, label: string) => {
  const items = extractSectionItems($, label);
  return items.length ? items.join(" ") : undefined;
};
