import express from "express";
import { UserControllers } from "./user.controller";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.patch("/setup-profile", auth(), UserControllers.setupProfile);
router.post(
  "/create",
  validateRequest(userValidation.userRegisterValidationSchema),
  UserControllers.createUser,
);
router.post(
  "/signup-verification",
  validateRequest(userValidation.verificationSchema),
  UserControllers.signupVerification,
);
router.get("/:id", UserControllers.getSingleUser);
router.get("/", auth(UserRole.Admin), UserControllers.allUsers);
router.get("/details/:id", auth(UserRole.Admin), UserControllers.userDetails);
router.patch("/block-unblock/:id", auth(UserRole.Admin), UserControllers.blockUnblockUser);

export const userRoutes = router;
