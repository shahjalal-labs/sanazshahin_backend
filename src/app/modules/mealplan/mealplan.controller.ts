import { mealplanServices } from "./mealplan.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";

const generateMealplan = catchAsync(async (req, res) => {
  const recipeId = req.params.id;
 

  const data = await mealplanServices.generateMealplan(req.user.id, [recipeId]);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "The mealplan has been generated successfully",
    data,
  });
});

// const regenerateMealplan = catchAsync(async (req, res) => {
//   const data = await mealplanServices.regenerateMealplan(
//     req.params.mealId,
//     req.user.id,
//   );
//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "The meal plan has been regenerated successfully",
//     data,
//   });
// });

const createMealplan = catchAsync(async (req, res) => {
  const data = await mealplanServices.createMealPlans(req.body, req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "The mealplan has been created successfully",
    data,
  });
});

const getMealplanById = catchAsync(async (req, res) => {
  const result = await mealplanServices.getMealplanById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "mealplan has been retrived successfully",
    data: result,
  });
});

const updateMealplan = catchAsync(async (req, res) => {
  const { mealId } = req.params;
  await mealplanServices.updateMealplan(mealId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "mealplan has been updated successfully",
  });
});

const deleteMealplan = catchAsync(async (req, res) => {
  await mealplanServices.deleteMealplan(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "mealplan has been deleted successfully",
  });
});
const nonGeneratedPlans = catchAsync(async (req, res) => {
  const result = await mealplanServices.getNonGeneratedRecipes();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Available recipes retrieved successfully",
    data: result,
  });
});
const myMealPlans = catchAsync(async (req, res) => {
  const result = await mealplanServices.myMealPlans(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "My meal plans retrieved successfully",
    data: result,
  });
});

export const mealplanControllers = {
  generateMealplan,
  // regenerateMealplan,
  createMealplan,
  getMealplanById,
  updateMealplan,
  deleteMealplan,
  nonGeneratedPlans,
  myMealPlans,
};
