import { Prisma, User } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import bcrypt from "bcryptjs";
import prisma from "../../../shared/prisma";
import generateOTP from "../../../helpers/generateOtp";
import config from "../../../config";
import sendEmail from "../../../helpers/sendEmail";
import { emailBody } from "../../../helpers/emailTemplate";
import { SignOptions } from "jsonwebtoken";
import { jwtHelper } from "../../../helpers/jwtHelpers";

const createUser = async (payload: User) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email.");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.jwt.gen_salt),
  );

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.pendingUser.upsert({
      where: { email: payload.email },
      update: {
        email: payload.email,
        fullName: payload.fullName,
        otp,
        expiresAt,
        password: hashedPassword,
      },
      create: {
        email: payload.email,
        fullName: payload.fullName,
        otp,
        expiresAt,
        password: hashedPassword,
      },
    });
  });

  const emailSubject = "Signup Verification";
  const html = emailBody(payload.fullName, otp);
  await sendEmail(payload.email, emailSubject, html);

  return otp;
};

const signupVerification = async (payload: { email: string; otp: string }) => {
  const { email, otp } = payload;
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email.");
  }

  const pendingUser = await prisma.pendingUser.findUnique({
    where: { email },
  });
  if (!pendingUser) {
    throw new ApiError(404, "No pending user found. Please sign up again.");
  }

  if (new Date() > pendingUser.expiresAt) {
    await prisma.pendingUser.delete({ where: { email } });
    throw new ApiError(400, "OTP has expired. Please sign up again.");
  }

  if (otp !== pendingUser.otp) {
    throw new ApiError(401, "Invalid OTP.");
  }

  const user = await prisma.user.create({
    data: {
      email: pendingUser.email,
      fullName: pendingUser.fullName,
      password: pendingUser.password,
    },
  });

  await prisma.notifyOption.create({
    data: {
      userId: user.id,
    },
  });

  await prisma.pendingUser.delete({ where: { email } });

  const accessToken = jwtHelper.generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as SignOptions["expiresIn"],
  );

  return {
    id: user.id,
    accessToken,
  };
};

const setupProfile = async (userId: string, payload: User) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) throw new ApiError(404, "User not found");

  await prisma.user.update({
    where: { id: userId },
    data: payload,
  });

  return;
};

const getSingleUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, "user not found!");
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
};

const getAllUsersFromDB = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  const whereCondition: Prisma.UserWhereInput = {
    role: "User",
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const totalUsers = await prisma.user.count({
    where: { role: "User" },
  });

  const filteredUsersCount = await prisma.user.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredUsersCount / limit);

  const users = await prisma.user.findMany({
    where: whereCondition,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      profileImage: true,
      fullName: true,
      status: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          mealPlans: true,
        },
      },
    },
  });

  return {
    meta: {
      totalUsers,
      filteredUsers: filteredUsersCount,
      totalPages,
      currentPage: page,
    },
    users,
  };
};

const getUserDetailsFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      profileImage: true,
      bio: true,
      status: true,
      _count: {
        select: {
          mealPlans: true,
        },
      },
    },
  });

  return user;
};

const toggleUserStatusIntoDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: user.status == "Active" ? "Blocked" : "Active",
    },
  });

  return {
    message: `User ${user.status == "Active" ? "blocked" : "activated"} successfully`,
  };
};

export const userService = {
  getSingleUser,
  setupProfile,
  createUser,
  signupVerification,
  getAllUsersFromDB,
  getUserDetailsFromDB,
  toggleUserStatusIntoDB,
};
