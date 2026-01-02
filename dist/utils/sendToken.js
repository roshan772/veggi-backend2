"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = void 0;
const sendToken = (user, statusCode, res) => {
    const token = user.getSignedJwtToken(); //Creating jwt token
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    // remove password from response
    user.password = undefined;
    res.status(statusCode).cookie("token", token, cookieOptions).json({
        success: true,
        user,
    });
};
exports.sendToken = sendToken;
