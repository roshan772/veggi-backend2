import { NextFunction, Request, Response } from "express";

interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}
//Main error Handler
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  // Log errors in development
  if (!isProd) {
    console.error("❌ ERROR LOG: ", err);
  }

  //build the responce Object
  const response: any = {
    success: false,
    message: err.message || "Internal Server Error",
  };
  // Only include stack + details in development mode
  if (!isProd) {
    response.stack = err.stack;
    response.details = err.details;
  }

  return res.status(statusCode).json(response);
};
