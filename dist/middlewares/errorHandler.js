"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
//Main error Handler
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isProd = process.env.NODE_ENV === "production";
    // Log errors in development
    if (!isProd) {
        console.error("❌ ERROR LOG: ", err);
    }
    //build the responce Object
    const response = {
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
exports.errorHandler = errorHandler;
