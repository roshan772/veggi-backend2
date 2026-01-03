import { Response } from "express";
import { IUser } from "../models/userModels";


export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();//Creating jwt token

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  // remove password from response
  user.password = undefined as any;

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    user,
  });
};
