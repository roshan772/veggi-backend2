"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.getAllOrders = exports.getMyOrders = exports.getSingleOrder = exports.createOrder = void 0;
const asyncHandler_1 = require("../middlewares/asyncHandler");
const orderModel_1 = __importDefault(require("../models/orderModel"));
const AppError_1 = require("../utils/AppError");
const productModels_1 = __importDefault(require("../models/productModels"));
// CREATE NEW ORDER
//http://localhost:8000/api/v1/order/new
exports.createOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderItems, shippingInfo, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, } = req.body;
    const order = await orderModel_1.default.create({
        user: req.user.id,
        orderItems,
        shippingInfo,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });
    res.status(201).json({
        success: true,
        order,
    });
});
//Get Single Order
//http://localhost:8000/api/v1/order/69325bb11317a47d7bcfd20d
exports.getSingleOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await orderModel_1.default.findById(req.params.id).populate("user", "name email");
    if (!order)
        throw new AppError_1.AppError("Order not found", 404);
    res.status(200).json({
        success: true,
        order,
    });
});
//Get Logged User Order
//http://localhost:8000/api/v1/order/myorders
exports.getMyOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const orders = await orderModel_1.default.find({ user: req.user.id });
    res.status(200).json({
        success: true,
        orders,
    });
});
//******************************************************* */
//******************** ADMIN **************************** */
//******************************************************* */
//http://localhost:8000/api/v1/order/
exports.getAllOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const orders = await orderModel_1.default.find();
    res.status(200).json({
        success: true,
        orders,
    });
});
//Update Order
// UPDATE ORDER (ADMIN)http://localhost:8000/api/v1/order/6932745e1a5ffd0c19cc4caf
exports.updateOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await orderModel_1.default.findById(req.params.id);
    if (!order)
        throw new AppError_1.AppError("Order not found", 404);
    if (order.orderStatus === "Delivered")
        throw new AppError_1.AppError("Order already delivered", 400);
    // Update stock only when delivered
    if (req.body.status === "Delivered") {
        for (const item of order.orderItems) {
            await updateStock(item.product.toString(), item.quantity);
        }
        order.deliveredAt = new Date();
    }
    order.orderStatus = req.body.status;
    await order.save();
    res.status(200).json({
        success: true,
        order,
    });
});
//Delete Order
// DELETE ORDER (ADMIN)http://localhost:8000/api/v1/order/6932745e1a5ffd0c19cc4caf
exports.deleteOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await orderModel_1.default.findById(req.params.id);
    if (!order)
        throw new AppError_1.AppError("Order not found", 404);
    await order.deleteOne();
    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
    });
});
// Reduce product stock
const updateStock = async (productId, quantity) => {
    const product = await productModels_1.default.findById(productId);
    if (!product)
        return;
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false });
};
