import express from "express";
import {
  createOrder,
  getSingleOrder,
  getMyOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController";

import { protect, authorizeRoles } from "../middlewares/authenticate";

const router = express.Router();

// User routes
router.post("/new", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getSingleOrder);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.put("/:id", protect, authorizeRoles("admin"), updateOrder);
router.delete("/:id", protect, authorizeRoles("admin"), deleteOrder);

export default router;
