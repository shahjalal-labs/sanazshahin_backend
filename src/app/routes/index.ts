import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoute } from "../modules/auth/auth.routes";
import { recipeRoutes } from "../modules/recipe/recipe.routes";
import { mealplanRoutes } from "../modules/mealplan/mealplan.routes";
import { notificationRoute } from "../modules/notification/notification.route";

const router = express.Router();

const moduleRoutes = [
  { path: "/user", route: userRoutes },
  { path: "/auth", route: authRoute },
  { path: "/recipe", route: recipeRoutes },
  { path: "/meal-plan", route: mealplanRoutes },
  { path: "/notification", route: notificationRoute },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
