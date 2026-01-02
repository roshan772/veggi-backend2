"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModels_1 = __importDefault(require("../models/userModels"));
// Protect routes using JWT in cookies
const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            const error = new Error("Not authorized — please login");
            error.statusCode = 401;
            return next(error);
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await userModels_1.default.findById(decoded.id).select("-password");
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }
        req.user = user;
        next();
    }
    catch (err) {
        err.statusCode = 401;
        err.message = "Token invalid or expired";
        next(err);
    }
};
exports.protect = protect;
// Role-based authorization
const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        const error = new Error("Access denied — insufficient permissions");
        error.statusCode = 403;
        return next(error);
    }
    next();
};
exports.authorizeRoles = authorizeRoles;
