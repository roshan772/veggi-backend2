import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/userModels";

export interface AuthRequest extends Request {
  user?: IUser;
}

// Protect routes using JWT in cookies
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      const error: any = new Error("Not authorized — please login");
      error.statusCode = 401;
      return next(error);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err: any) {
    err.statusCode = 401;
    err.message = "Token invalid or expired";
    next(err);
  }
};

// Role-based authorization
export const authorizeRoles =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error: any = new Error("Access denied — insufficient permissions");
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
