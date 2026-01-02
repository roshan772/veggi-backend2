import { Router } from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/authController";
import { protect, authorizeRoles } from "../middlewares/authenticate";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// User routes
router.get("/me", protect, getMyProfile);
router.put("/me/update", protect, updateProfile);
router.put("/me/change-password", protect, changePassword);

// Admin routes
router.get("/admin/", protect, authorizeRoles("admin"), getAllUsers);
router.get("/admin/:id", protect, authorizeRoles("admin"), getUser);
router.put("/admin/:id", protect, authorizeRoles("admin"), updateUser);
router.delete("/admin/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;
