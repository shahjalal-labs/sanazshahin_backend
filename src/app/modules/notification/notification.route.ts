import express from "express";
import auth from "../../middlewares/auth";
import { notificationController } from "./notification.controller";

const router = express.Router();

router.get("/options", auth(), notificationController.userWiseNotifyOptions);
router.put("/toggle", auth(), notificationController.toggleNotifyOption);


export const notificationRoute = router;
