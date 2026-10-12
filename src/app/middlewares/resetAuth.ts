import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiErrors";
import { jwtHelper } from "../../helpers/jwtHelpers";

const resetAuth = (...roles: string[]) => {
  return async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token)
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized! No token provided.",
        );

      const verifiedUser = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as Secret,
      );

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden! You are not authorized!",
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default resetAuth;
