import express from "express";
import { recipeControllers } from "./recipe.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import { recipeValidation } from "./recipe.validation";

const router = express.Router();

router.post(
  "/create",
  auth(),
  fileUploader.recipeImage,
  parseBodyData,
  validateRequest(recipeValidation.recipeValidationSchema),
  recipeControllers.createRecipe,
);
router.get("/my-recipes", auth(), recipeControllers.myRecipes);
router.get("/all", auth(), recipeControllers.getAllRecipes);
router.get("/details/:id", recipeControllers.getRecipeById);
router.put(
  "/update",
  auth(),
  fileUploader.recipeImage,
  parseBodyData,
  validateRequest(recipeValidation.updateRecipeValidationSchema),
  recipeControllers.updateRecipe,
);
router.delete(
  "/:id",
  auth(),
  recipeControllers.deleteRecipe,
);

router.post("/toggle-bookmark/:id", auth(), recipeControllers.toggleBookmark);
router.get("/user-bookmarks", auth(), recipeControllers.getUserBookmarks);
router.get("/scraped-recipes", recipeControllers.getScrappedRecipes);
router.get(
  "/scraped-recipes/details/:name",
  recipeControllers.getScrappedRecipyDetails,
);
router.post(
  "/grocery-list/:id",
  recipeControllers.createGroceryList,
);

export const recipeRoutes = router;
