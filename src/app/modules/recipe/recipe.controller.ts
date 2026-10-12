import { recipeServices } from "./recipe.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";

const createRecipe = catchAsync(async (req, res) => {
  await recipeServices.createRecipe(req);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Recipe created successfully",
  });
});
const myRecipes = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await recipeServices.getMyRecipesFromDB(
    req.user?.id,
    page,
    limit,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "My recipes retrieved successfully",
    data: result,
  });
});

const getAllRecipes = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const userId = req.user.id;
  const result = await recipeServices.getAllRecipes(userId, page, limit);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All recipes has been retrived successfully",
    data: result,
  });
});

const getRecipeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await recipeServices.getRecipeById(id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "recipe has been retrived successfully",
    data: result,
  });
});

const updateRecipe = catchAsync(async (req, res) => {
  await recipeServices.updateRecipe(req);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "recipe has been updated successfully",
  });
});

const deleteRecipe = catchAsync(async (req, res) => {
  const { id } = req.params;
  await recipeServices.deleteRecipe(id, req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "recipe has been deleted successfully",
  });
});
const toggleBookmark = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await recipeServices.toggleBookmark(id, req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: result.message,
  });
});
const getUserBookmarks = catchAsync(async (req, res) => {
  const result = await recipeServices.getUserBookmarks(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User bookmarks retrieved successfully",
    data: result,
  });
});

const getScrappedRecipes = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const search = (req.query.search as string) || undefined;
  const result = await recipeServices.getScrappedRecipes(page, limit, search);
  res.status(200).json({
    success: true,
    message: "Scraped recipes have been retrieved successfully",
    data: result,
  });
});

const getScrappedRecipyDetails = catchAsync(async (req, res) => {
  const { name } = req.params;
  const result = await recipeServices.getScrappedRecipyDetails(name);
  res.status(200).json({
    success: true,
    message: "Scraped recipe details have been retrieved successfully",
    data: result,
  });
});

const createGroceryList = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await recipeServices.createGroceryList(id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Grocery list created successfully",
    data: result,
  });
});

export const recipeControllers = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getScrappedRecipes,
  getScrappedRecipyDetails,
  myRecipes,
  toggleBookmark,
  getUserBookmarks,
  createGroceryList,
};
