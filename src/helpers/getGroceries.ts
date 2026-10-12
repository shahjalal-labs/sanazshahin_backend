// groceryListGenerator.ts

type GroceryItem = {
  name: string;
  quantity: number;
  unit: string;
};

type GroceryCategory = {
  category: string;
  items: GroceryItem[];
};

type IngredientInfo = {
  category: string;
  quantity: number;
  unit: string;
};

// All categories that should always appear in the output, even if empty
const ALL_CATEGORIES = ["Produce", "Dairy", "Grains", "Meat", "Pantry", "Other"];

// --- Tier 1: Known ingredients with precise defaults ---
const INGREDIENT_MAP: Record<string, IngredientInfo> = {
  // Produce
  tomato: { category: "Produce", quantity: 3, unit: "pcs" },
  tomatoes: { category: "Produce", quantity: 3, unit: "pcs" },
  "green beans": { category: "Produce", quantity: 200, unit: "g" },
  beans: { category: "Produce", quantity: 200, unit: "g" },
  onion: { category: "Produce", quantity: 1, unit: "pc" },
  garlic: { category: "Produce", quantity: 3, unit: "cloves" },
  ginger: { category: "Produce", quantity: 1, unit: "pc" },
  potato: { category: "Produce", quantity: 2, unit: "pcs" },
  pepper: { category: "Produce", quantity: 1, unit: "pc" },
  "bell pepper": { category: "Produce", quantity: 1, unit: "pc" },
  "red bell pepper": { category: "Produce", quantity: 1, unit: "pc" },
  lettuce: { category: "Produce", quantity: 1, unit: "pc" },
  cucumber: { category: "Produce", quantity: 1, unit: "pc" },
  lemon: { category: "Produce", quantity: 1, unit: "pc" },
  lime: { category: "Produce", quantity: 1, unit: "pc" },
  carrot: { category: "Produce", quantity: 2, unit: "pcs" },
  spinach: { category: "Produce", quantity: 200, unit: "g" },
  broccoli: { category: "Produce", quantity: 1, unit: "pc" },
  mushroom: { category: "Produce", quantity: 200, unit: "g" },
  avocado: { category: "Produce", quantity: 1, unit: "pc" },
  cilantro: { category: "Produce", quantity: 1, unit: "bunch" },
  parsley: { category: "Produce", quantity: 1, unit: "bunch" },
  mint: { category: "Produce", quantity: 1, unit: "bunch" },

  // Dairy
  yogurt: { category: "Dairy", quantity: 1, unit: "cup" },
  butter: { category: "Dairy", quantity: 100, unit: "g" },
  milk: { category: "Dairy", quantity: 1, unit: "cup" },
  cheese: { category: "Dairy", quantity: 100, unit: "g" },
  cream: { category: "Dairy", quantity: 1, unit: "cup" },
  feta: { category: "Dairy", quantity: 100, unit: "g" },

  // Grains
  "basmati rice": { category: "Grains", quantity: 2, unit: "cups" },
  rice: { category: "Grains", quantity: 2, unit: "cups" },
  flour: { category: "Grains", quantity: 1, unit: "cup" },
  bread: { category: "Grains", quantity: 1, unit: "loaf" },
  pasta: { category: "Grains", quantity: 200, unit: "g" },
  oats: { category: "Grains", quantity: 1, unit: "cup" },

  // Meat & Protein
  beef: { category: "Meat", quantity: 400, unit: "g" },
  chicken: { category: "Meat", quantity: 400, unit: "g" },
  mutton: { category: "Meat", quantity: 400, unit: "g" },
  lamb: { category: "Meat", quantity: 400, unit: "g" },
  fish: { category: "Meat", quantity: 300, unit: "g" },
  shrimp: { category: "Meat", quantity: 200, unit: "g" },
  egg: { category: "Meat", quantity: 2, unit: "pcs" },
  eggs: { category: "Meat", quantity: 2, unit: "pcs" },

  // Pantry
  "soyabean oil": { category: "Pantry", quantity: 1, unit: "cup" },
  oil: { category: "Pantry", quantity: 1, unit: "cup" },
  "olive oil": { category: "Pantry", quantity: 3, unit: "tbsp" },
  salt: { category: "Pantry", quantity: 1, unit: "tsp" },
  sugar: { category: "Pantry", quantity: 1, unit: "cup" },
  "black pepper": { category: "Pantry", quantity: 1, unit: "tsp" },
  paprika: { category: "Pantry", quantity: 1, unit: "tsp" },
  mustard: { category: "Pantry", quantity: 1, unit: "tsp" },
  vinegar: { category: "Pantry", quantity: 2, unit: "tbsp" },
  soy_sauce: { category: "Pantry", quantity: 2, unit: "tbsp" },
  honey: { category: "Pantry", quantity: 2, unit: "tbsp" },
};

// --- Tier 2: Heuristic fallback rules for anything not in the map ---
const CATEGORY_HEURISTICS: { keywords: string[]; category: string; unit: string; quantity: number }[] = [
  { keywords: ["oil", "sauce", "paste", "vinegar", "syrup", "spice", "powder", "seasoning"], category: "Pantry", unit: "tbsp", quantity: 1 },
  { keywords: ["beef", "chicken", "mutton", "lamb", "pork", "fish", "shrimp", "prawn", "meat", "steak"], category: "Meat", unit: "g", quantity: 300 },
  { keywords: ["cheese", "milk", "cream", "yogurt", "butter", "curd"], category: "Dairy", unit: "g", quantity: 100 },
  { keywords: ["rice", "flour", "pasta", "noodle", "bread", "oats", "wheat"], category: "Grains", unit: "cup", quantity: 1 },
  { keywords: ["leaf", "leaves", "herb", "green", "lettuce", "spinach", "salad"], category: "Produce", unit: "bunch", quantity: 1 },
];

const DEFAULT_CATEGORY = "Other";
const DEFAULT_QUANTITY = 1;
const DEFAULT_UNIT = "pc";

/**
 * Falls back to keyword-based heuristics when an ingredient
 * isn't found in the static INGREDIENT_MAP.
 */
const guessFromHeuristics = (name: string): IngredientInfo | null => {
  for (const rule of CATEGORY_HEURISTICS) {
    if (rule.keywords.some((kw) => name.includes(kw))) {
      return { category: rule.category, quantity: rule.quantity, unit: rule.unit };
    }
  }
  return null;
};

/**
 * Resolves category/quantity/unit for a single ingredient name,
 * trying exact match first, then heuristics, then default fallback.
 */
const resolveIngredient = (rawName: string): IngredientInfo => {
  const key = rawName.trim().toLowerCase();

  if (INGREDIENT_MAP[key]) {
    return INGREDIENT_MAP[key];
  }

  const heuristicMatch = guessFromHeuristics(key);
  if (heuristicMatch) {
    return heuristicMatch;
  }

  return { category: DEFAULT_CATEGORY, quantity: DEFAULT_QUANTITY, unit: DEFAULT_UNIT };
};

/**
 * Takes a flat list of ingredient names (e.g. recipe.ingredients)
 * and groups them into categorized grocery items with quantities.
 * Always returns every category in ALL_CATEGORIES, even if empty.
 */
export const generateGroceryList = (
  ingredients: string[]
): GroceryCategory[] => {
  // Initialize every category with an empty array up front
  const grouped: Record<string, GroceryItem[]> = {};
  for (const category of ALL_CATEGORIES) {
    grouped[category] = [];
  }

  for (const rawName of ingredients) {
    const { category, quantity, unit } = resolveIngredient(rawName);

    // Safety net: if resolveIngredient ever returns a category
    // not in ALL_CATEGORIES, create it on the fly instead of crashing.
    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push({
      name: rawName, // keep original casing for display
      quantity,
      unit,
    });
  }

  return ALL_CATEGORIES.map((category) => ({
    category,
    items: grouped[category] ?? [],
  }));
};