import { MealPlan, PlanType, Recipe } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { recipeProcessorService } from "../../../services";
import ApiError from "../../../errors/ApiErrors";

const generateMealplan = async (userId: string, recipeIds: string[]) => {
  const userInfo = await prisma.user.findUnique({ where: { id: userId } });
  if (!userInfo) throw new ApiError(404, "User not found");

  if (!recipeIds || recipeIds.length === 0) {
    throw new ApiError(400, "At least one recipe ID is required");
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      id: { in: recipeIds },
    },
  });

  if (recipes.length === 0) {
    throw new ApiError(404, "No recipes found for the provided IDs");
  }

  // Preserve the order of recipeIds passed by the user
  const orderedRecipes = recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is Recipe => !!r);

  return await recipeProcessorService.generateMealplan(userInfo, orderedRecipes);
};

// const regenerateMealplan = async (mealId: string, userId: string) => {
//   const userInfo = await prisma.user.findUnique({ where: { id: userId } });
//   if (!userInfo) throw new ApiError(404, "User not found");

//   const mealPlanInfo = await prisma.mealPlan.findUnique({
//     where: { id: mealId },
//   });
//   if (!mealPlanInfo) throw new ApiError(404, "Meal plan not found");

//   return await recipeProcessorService.regenerateMealplan(
//     userInfo,
//     mealPlanInfo,
//   );
// };

const createMealPlans = async (mealInfo: any, userId: string) => {
  const recipeInfo = await prisma.recipe.findUnique({
    where: { id: mealInfo.recipeId },
  });
  if (!recipeInfo) throw new ApiError(404, "Recipe not found");
  await prisma.mealPlan.create({
    data: {
      userId,
      recipeId: mealInfo.recipeId,
      carb: typeof mealInfo.carb === "number" ? mealInfo.carb : 30,
      iron: typeof mealInfo.iron === "number" ? mealInfo.iron : 10,
      protein: typeof mealInfo.protein === "number" ? mealInfo.protein : 20,
      fiber: typeof mealInfo.fiber === "number" ? mealInfo.fiber : 15,
      fat: typeof mealInfo.fat === "number" ? mealInfo.fat : 10,
      kcal: typeof mealInfo.kcal === "number" ? mealInfo.kcal : (typeof mealInfo.calorie === "number" ? mealInfo.calorie : 20),
      selectedDate: mealInfo.selectedDate,
    },
  });
  return;
};

const myMealPlans = async (userId: string) => {
  const mealPlans = await prisma.mealPlan.findMany({
    where: { userId },
    select: {
      id:true,
      selectedDate:true,
      recipe: {
        select: {
          id:true,
          recipeName: true,
          recipeImage: true,
        },
      },
    },
  });

  return mealPlans
};

const getMealplanById = async (id: string) => {
  const result = await prisma.mealPlan.findUnique({ where: { id } });
  return result;
};

const updateMealplan = async (id: string, data: MealPlan) => {
  const existingMealPlan = await prisma.mealPlan.findUnique({ where: { id } });
  if (!existingMealPlan) throw new ApiError(404, "Meal plan not found");

  await prisma.mealPlan.update({ where: { id }, data });
  return;
};

const deleteMealplan = async (id: string) => {
  await prisma.mealPlan.delete({ where: { id } });
  return;
};

const getNonGeneratedRecipes = async () => {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      recipeName: true,
      recipeImage: true,
    },
  });
  return recipes;
};

export const mealplanServices = {
  generateMealplan,
  // regenerateMealplan,
  createMealPlans,
  getMealplanById,
  updateMealplan,
  deleteMealplan,
  getNonGeneratedRecipes,
  myMealPlans,
};
