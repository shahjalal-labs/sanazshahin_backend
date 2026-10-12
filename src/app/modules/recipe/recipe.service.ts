import { Recipe } from "@prisma/client";
import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { uploadInSpace } from "../../../helpers/uploadInSpace";
import { Request } from "express";
import {
  extractImageUrls,
  extractSectionItems,
  extractSectionText,
  findRecipeCardByName,
  ScrapedRecipeDetails,
  scrapeRecipes,
} from "../../../helpers/recipe.helper";
import { generateGroceryList } from "../../../helpers/getGroceries";

const createRecipe = async (req: Request) => {
  const file = req.file as Express.Multer.File | undefined;
  const userId = req.user?.id;
  const payload = req.body as Recipe;

  const existingRecipe = await prisma.recipe.findFirst({
    where: { recipeName: payload.recipeName },
  });

  if (existingRecipe) {
    throw new ApiError(409, "A recipe with this name already exists.");
  }

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const recipeImage = file ? await processImage(file, "recipeImage") : null;

  if (!recipeImage) {
    throw new ApiError(400, "Recipe image is required.");
  }

  await prisma.recipe.create({
    data: {
      ...payload,
      userId,
      recipeImage,
    },
  });

  return;
};

const getMyRecipesFromDB = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const recipeCount = await prisma.recipe.count({ where: { userId } });
  const totalPages = Math.ceil(recipeCount / limit);

  const recipes = await prisma.recipe.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      recipeName: true,
      recipeImage: true,
    },
  });

  return { meta: { totalPages, currentPage: page }, recipes };
};

const getRecipeById = async (id: string) => {
  const result = await prisma.recipe.findUnique({
    where: { id },
    omit: {
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });
  if (!result) throw new ApiError(404, "Recipe not found");
  return result;
};

const getAllRecipes = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const recipes = await prisma.recipe.findMany({
    where: { NOT: { userId } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      recipeName: true,
      recipeImage: true,
      bookmarks: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  const totalCount = await prisma.recipe.count({ where: { NOT: { userId } } });
  const totalPages = Math.ceil(totalCount / limit);

  const result = recipes.map(({ bookmarks, ...recipe }) => ({
    ...recipe,
    isBookmarked: bookmarks.length > 0,
  }));

  return {
    meta: {
      totalPages,
      currentPage: page,
    },
    recipes: result,
  };
};

const updateRecipe = async (req: Request) => {
  const file = req.file as Express.Multer.File | undefined;
  const payload = req.body;

  const recipe = await prisma.recipe.findUniqueOrThrow({
    where: { id: payload.recipeId },
  });

  const allRecipes = await prisma.recipe.findMany({
    select: { recipeName: true, id: true },
  });

  if (
    payload.recipeName &&
    allRecipes.some(
      (r) => r.recipeName === payload.recipeName && r.id !== payload.recipeId,
    )
  ) {
    throw new ApiError(409, "A recipe with this name already exists.");
  }

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const recipeImage = file ? await processImage(file, "recipeImage") : null;

  await prisma.recipe.update({
    where: { id: payload.recipeId },
    data: {
      recipeName: payload.recipeName || recipe.recipeName,
      recipeImage: recipeImage || recipe.recipeImage,
      hymi: payload.hymi || recipe.hymi,
      duration: payload.duration || recipe.duration,
      energy: payload.energy || recipe.energy,
      features: payload.features || recipe.features,
      nutrition: payload.nutrition || recipe.nutrition,
      wyn: payload.wyn || recipe.wyn,
      youtubeLink: payload.youtubeLink || recipe.youtubeLink,
      equipments: payload.equipments || recipe.equipments,
      ingredients: payload.ingredients || recipe.ingredients,
    },
  });

  return;
};

const deleteRecipe = async (id: string, userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const existingRecipe = await prisma.recipe.findUniqueOrThrow({
    where: { id },
  });

  if (user.id !== existingRecipe.userId) {
    throw new ApiError(403, "You can only delete your own recipes.");
  }

  await prisma.recipe.delete({ where: { id } });
  return;
};

const toggleBookmark = async (recipeId: string, userId: string) => {
  await prisma.recipe.findUniqueOrThrow({ where: { id: recipeId } });
  await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const existingBookmark = await prisma.bookmark.findFirst({
    where: { recipeId, userId },
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
    return { message: "Recipe removed from bookmarks." };
  }

  await prisma.bookmark.create({
    data: { recipeId, userId },
  });
  return { message: "Recipe added to bookmarks." };
};

const getUserBookmarks = async (userId: string) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    select: {
      recipe: {
        select: {
          id: true,
          recipeName: true,
          recipeImage: true,
        },
      },
    },
  });

  return bookmarks;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const getScrappedRecipes = async (
  page: number = 1,
  limit: number = 28,
  search?: string,
) => {
  const recipes = await scrapeRecipes();

  if (!recipes.length) {
    throw new ApiError(404, "No scraped recipes were found.");
  }

  // Filter by search query if provided
  let filteredRecipes = recipes;
  if (search && search.trim()) {
    const searchQuery = normalizeText(search);
    filteredRecipes = recipes.filter((recipe) =>
      normalizeText(recipe.title).includes(searchQuery),
    );
  }

  if (!filteredRecipes.length && search) {
    throw new ApiError(404, "No recipes found matching your search.");
  }

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 28;
  const skip = (safePage - 1) * safeLimit;
  const paginatedRecipes = filteredRecipes.slice(skip, skip + safeLimit);

  return {
    totalCount: filteredRecipes.length,
    totalPages: Math.ceil(filteredRecipes.length / safeLimit),
    currentPage: safePage,
    recipes: paginatedRecipes,
  };
};

const getScrappedRecipyDetails = async (
  name: string,
): Promise<ScrapedRecipeDetails> => {
  const recipeCard = await findRecipeCardByName(name);
  const response = await axios.get(recipeCard.link, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const $ = cheerio.load(response.data);

  const title = $("h1").first().text().trim() || recipeCard.title;
  const pageCategory = $("h2, h3").first().text().trim();
  const images = extractImageUrls($);
  const image =
    $("meta[property='og:image']").attr("content") ||
    images[0] ||
    recipeCard.image;
  const description =
    $("meta[name='description']").attr("content") ||
    extractSectionText($, "Description");

  // extract video URL from embedly iframe
  const embedlyIframe = $(
    "iframe.embedly-embed, iframe[src*='embedly']",
  ).first();
  let videoUrl: string | undefined;

  const rawSrc = embedlyIframe.attr("src");
  if (rawSrc) {
    const fullSrc = rawSrc.startsWith("//") ? `https:${rawSrc}` : rawSrc;
    videoUrl = new URL(fullSrc).searchParams.get("url") || undefined;
  }

  return {
    title,
    image,
    images,
    link: recipeCard.link,
    category: pageCategory || recipeCard.category,
    features: recipeCard.features,
    description,
    ingredients: extractSectionItems($, "Ingredients"),
    equipments: extractSectionItems($, "Equipments"),
    instructions: extractSectionItems($, "Instructions"),
    notes: extractSectionItems($, "Notes"),
    tips: extractSectionItems($, "Tips"),
    storage: extractSectionItems($, "Storage"),
    swaps: extractSectionItems($, "Swaps"),
    nutrition: extractSectionText($, "Nutrition"),
    videoUrl,
  };
};

const createGroceryList = async (recipeId: string) => {
  const recipe = await prisma.recipe.findUniqueOrThrow({
    where: { id: recipeId },
  });

  const groceryList = generateGroceryList(recipe.ingredients);

  return groceryList;
};

export const recipeServices = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getScrappedRecipes,
  getScrappedRecipyDetails,
  getMyRecipesFromDB,
  toggleBookmark,
  getUserBookmarks,
  createGroceryList,
};
