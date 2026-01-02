import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../utils/AppError";
import User from "../models/userModels";
import { sendToken } from "../utils/sendToken";
import { sendEmail } from "../utils/sendEmail";
import * as crypto from "crypto";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/"); // Edited: Specific folder for avatars (create if not exists)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // No change: Good for uniqueness
  },
});

export const upload = multer({ storage }); // No change: Fine for single file

//Register User :http://localhost:8000/api/v1/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    throw new AppError("Name, email and password are required", 400);
  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already registered", 400);
  // Edited: Handle avatar file from multer (req.file)
  let avatar = {
    public_id: "", // Placeholder for Cloudinary public_id (if using)
    url: "https://res.cloudinary.com/default-image/avatar_placeholder.png", // Default URL
  };
  if (req.file) {
    // Check if file uploaded
    avatar.url = `http://localhost:8000/uploads/avatars/${req.file.filename}`; // Local URL (adjust for prod/CDN)
    avatar.public_id = req.file.filename; // Use filename as public_id (simple)
  }
  const user = await User.create({ name, email, password, avatar });
  sendToken(user, 201, res);
});

//Login User : http://localhost:8000/api/v1/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError("Email and password required", 400);
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 401);
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);
  sendToken(user, 200, res);
});

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()), // expires immediately
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

//http://localhost:8000/api/v1/auth/forgot-password 
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new AppError("User not found with this email", 404);

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset-password/${resetToken}`;

    // Email message
    const message = `You requested a password reset.\n\nPlease click the link below to reset your password:\n${resetUrl}\n\nIf you did not request this, ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Reset link sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError("Email could not be sent", 500);
    }
  }
);

// PUT /api/v1/auth/reset-password/:token
//http://localhost:8000/api/v1/auth/reset-password/c1b1e2587949d5092165c558526068bc8426e11d
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: new Date() }, //greter than current time gt
    });

    if (!user)
      throw new AppError("Password reset token Invalid or expired token", 400);
    if (req.body.password !== req.body.confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({validateBeforeSave: false});

   sendToken(user, 200, res);
  }
);

//Get Profile of logged in user
// http://localhost:8000/api/v1/auth/me
export const getMyProfile = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user profile
// http://localhost:8000/api/v1/auth/me/update
export const updateProfile = asyncHandler(async (req: any, res: Response) => {
  const newData: any = {
    name: req.body.name,
    email: req.body.email,
  };

  // If avatar is sent
  if (req.body.avatar) {
    newData.avatar = req.body.avatar;
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Change password
// PUT /api/v1/auth/me/change-password
export const changePassword = asyncHandler(
  async (req: any, res: Response) => {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) throw new AppError("User not found", 404);

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      throw new AppError("Please provide old and new password", 400);

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) throw new AppError("Old password is incorrect", 401);

    user.password = newPassword;
    await user.save();

    sendToken(user, 200, res);
  }
);


//******************************************************* */
//******************** ADMIN **************************** */
//******************************************************* */

//Get all Users-admin
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//get single user-admin
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) throw new AppError("User not found", 404);

  res.status(200).json({
    success: true,
    user,
  });
});

//update user -admin
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const newData: any = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Delete User -admin
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) throw new AppError("User not found", 404);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});




