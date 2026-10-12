import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { userService } from "./user.services";

const createUser = catchAsync(async (req, res) => {
  const result = await userService.createUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Check your email for signup verification",
    data: result,
  });
});

const signupVerification = catchAsync(async (req, res) => {
  const result = await userService.signupVerification(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "OTP verification successful",
    data: result,
  });
});

const setupProfile = catchAsync(async (req, res) => {
  const result = await userService.setupProfile(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile setup successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const user = await userService.getSingleUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User retrieved successfully",
    data: user,
  });
});

const allUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await userService.getAllUsersFromDB(
    page,
    limit,
    req.query.search as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: result,
  });
});

const userDetails = catchAsync(async (req, res) => {
  const user = await userService.getUserDetailsFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User details retrieved successfully",
    data: user,
  });
});

const blockUnblockUser = catchAsync(async (req, res) => {
  const result = await userService.toggleUserStatusIntoDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
  });
});

export const UserControllers = {
  getSingleUser,
  setupProfile,
  createUser,
  signupVerification,
  allUsers,
  userDetails,
  blockUnblockUser,
};
