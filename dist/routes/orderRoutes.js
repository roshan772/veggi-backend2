"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const authenticate_1 = require("../middlewares/authenticate");
const router = express_1.default.Router();
// User routes
router.post("/new", authenticate_1.protect, orderController_1.createOrder);
router.get("/myorders", authenticate_1.protect, orderController_1.getMyOrders);
router.get("/:id", authenticate_1.protect, orderController_1.getSingleOrder);
// Admin routes
router.get("/", authenticate_1.protect, (0, authenticate_1.authorizeRoles)("admin"), orderController_1.getAllOrders);
router.put("/:id", authenticate_1.protect, (0, authenticate_1.authorizeRoles)("admin"), orderController_1.updateOrder);
router.delete("/:id", authenticate_1.protect, (0, authenticate_1.authorizeRoles)("admin"), orderController_1.deleteOrder);
exports.default = router;
