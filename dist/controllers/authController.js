"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = exports.changePassword = exports.updateProfile = exports.getMyProfile = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.register = exports.upload = void 0;
const asyncHandler_1 = require("../middlewares/asyncHandler");
const AppError_1 = require("../utils/AppError");
const userModels_1 = __importDefault(require("../models/userModels"));
const sendToken_1 = require("../utils/sendToken");
const sendEmail_1 = require("../utils/sendEmail");
const crypto = __importStar(require("crypto"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/avatars/"); // Edited: Specific folder for avatars (create if not exists)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // No change: Good for uniqueness
    },
});
exports.upload = (0, multer_1.default)({ storage }); // No change: Fine for single file
//Register User :http://localhost:8000/api/v1/auth/register
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        throw new AppError_1.AppError("Name, email and password are required", 400);
    const exists = await userModels_1.default.findOne({ email });
    if (exists)
        throw new AppError_1.AppError("Email already registered", 400);
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
    const user = await userModels_1.default.create({ name, email, password, avatar });
    (0, sendToken_1.sendToken)(user, 201, res);
});
//Login User : http://localhost:8000/api/v1/auth/login
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw new AppError_1.AppError("Email and password required", 400);
    const user = await userModels_1.default.findOne({ email }).select("+password");
    if (!user)
        throw new AppError_1.AppError("Invalid credentials", 401);
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
        throw new AppError_1.AppError("Invalid credentials", 401);
    (0, sendToken_1.sendToken)(user, 200, res);
});
const logout = (req, res) => {
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
exports.logout = logout;
//http://localhost:8000/api/v1/auth/forgot-password 
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userModels_1.default.findOne({ email: req.body.email });
    if (!user)
        throw new AppError_1.AppError("User not found with this email", 404);
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;
    // Email message
    const message = `You requested a password reset.\n\nPlease click the link below to reset your password:\n${resetUrl}\n\nIf you did not request this, ignore this email.`;
    try {
        await (0, sendEmail_1.sendEmail)({
            email: user.email,
            subject: "Password Reset",
            message,
        });
        res.status(200).json({
            success: true,
            message: `Reset link sent to ${user.email}`,
        });
    }
    catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError_1.AppError("Email could not be sent", 500);
    }
});
// PUT /api/v1/auth/reset-password/:token
//http://localhost:8000/api/v1/auth/reset-password/c1b1e2587949d5092165c558526068bc8426e11d
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await userModels_1.default.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: new Date() }, //greter than current time gt
    });
    if (!user)
        throw new AppError_1.AppError("Password reset token Invalid or expired token", 400);
    if (req.body.password !== req.body.confirmPassword) {
        throw new AppError_1.AppError("Passwords do not match", 400);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    (0, sendToken_1.sendToken)(user, 200, res);
});
//Get Profile of logged in user
// http://localhost:8000/api/v1/auth/me
exports.getMyProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userModels_1.default.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    });
});
//Update user profile
// http://localhost:8000/api/v1/auth/me/update
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const newData = {
        name: req.body.name,
        email: req.body.email,
    };
    // If avatar is sent
    if (req.body.avatar) {
        newData.avatar = req.body.avatar;
    }
    const user = await userModels_1.default.findByIdAndUpdate(req.user.id, newData, {
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
exports.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userModels_1.default.findById(req.user.id).select("+password");
    if (!user)
        throw new AppError_1.AppError("User not found", 404);
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
        throw new AppError_1.AppError("Please provide old and new password", 400);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch)
        throw new AppError_1.AppError("Old password is incorrect", 401);
    user.password = newPassword;
    await user.save();
    (0, sendToken_1.sendToken)(user, 200, res);
});
//******************************************************* */
//******************** ADMIN **************************** */
//******************************************************* */
//Get all Users-admin
exports.getAllUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const users = await userModels_1.default.find();
    res.status(200).json({
        success: true,
        users,
    });
});
//get single user-admin
exports.getUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userModels_1.default.findById(req.params.id);
    if (!user)
        throw new AppError_1.AppError("User not found", 404);
    res.status(200).json({
        success: true,
        user,
    });
});
//update user -admin
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };
    const user = await userModels_1.default.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        user,
    });
});
//Delete User -admin
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userModels_1.default.findById(req.params.id);
    if (!user)
        throw new AppError_1.AppError("User not found", 404);
    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});
