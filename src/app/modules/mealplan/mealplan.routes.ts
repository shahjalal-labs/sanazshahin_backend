import express from "express";
import { mealplanControllers } from "./mealplan.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/generate/:id",
  auth(),
  mealplanControllers.generateMealplan,
);
// router.post(
//   "/regenerate/:mealId",
//   auth(),
//   mealplanControllers.regenerateMealplan,
// );
router.post("/create", auth(), mealplanControllers.createMealplan);
router.get("/:id", auth(), mealplanControllers.getMealplanById);
router.patch("/:mealId", auth(), mealplanControllers.updateMealplan);
router.delete("/:id", auth(), mealplanControllers.deleteMealplan);
router.get("/available/recipes", mealplanControllers.nonGeneratedPlans);
router.get("/my/meal-plans", auth(), mealplanControllers.myMealPlans);

export const mealplanRoutes = router;
