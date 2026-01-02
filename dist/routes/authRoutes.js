"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authenticate_1 = require("../middlewares/authenticate");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
router.post("/register", upload_1.upload.single("avatar"), authController_1.register);
router.post("/login", authController_1.login);
router.post("/logout", authController_1.logout);
router.post("/forgot-password", authController_1.forgotPassword);
router.put("/reset-password/:token", authController_1.resetPassword);
// User routes
router.get("/me", authenticate_1.protect, authController_1.getMyProfile);
router.put("/me/update", authenticate_1.protect, authController_1.updateProfile);
router.put("/me/change-password", authenticate_1.protect, authController_1.changePassword);
// Admin routes
router.get("/admin/", authenticate_1.protect, (0, authenticate_1.authorizeRoles)("admin"), authController_1.getAllUsers);
router.get("/admin/:id", authenticate_1.protect, (0, authenticate_1.authorizeRoles)("admin"), authController_1.getUser);
router.put("/admin/:id", authenticate_1.protect, (0, authenticate_1.authorizeRoles)("admin"), authController_1.updateUser);
router.delete("/admin/:id", authenticate_1.protect, (0, authenticate_1.authorizeRoles)("admin"), authController_1.deleteUser);
exports.default = router;
