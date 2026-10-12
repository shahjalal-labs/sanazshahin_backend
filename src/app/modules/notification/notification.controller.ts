import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { notificationService } from "./notification.service";

const userWiseNotifyOptions = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await notificationService.getUserWiseNotifyOptions(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification options retrieved successfully.",
    data: result,
  });
});

const toggleNotifyOption = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { option } = req.body;
  await notificationService.toggleNotifyOptionIntoDB(userId, option);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Notify option toggled successfully",
  });
});

export const notificationController = {
  userWiseNotifyOptions,
  toggleNotifyOption,
};
