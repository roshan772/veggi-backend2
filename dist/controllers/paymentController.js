"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePayHereNotify = exports.generatePaymentHash = void 0;
const asyncHandler_1 = require("../middlewares/asyncHandler");
const md5_1 = __importDefault(require("md5"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
// ---------------------------------------------------------
// Generate PayHere Hash (NO order creation here)
// ---------------------------------------------------------
exports.generatePaymentHash = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { amount } = req.body;
    const merchantId = process.env.MERCHANT_ID;
    const merchantSecret = process.env.MERCHANT_SECRET;
    if (!merchantId || !merchantSecret) {
        return res.status(500).json({
            success: false,
            message: "Payment configuration missing",
        });
    }
    const orderId = Date.now().toString(); // unique
    const currency = "LKR";
    const formattedAmount = parseFloat(amount || 0).toFixed(2);
    const secretHash = (0, md5_1.default)(merchantSecret).toUpperCase();
    const paymentHash = (0, md5_1.default)(`${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`).toUpperCase();
    return res.json({
        success: true,
        orderId,
        hash: paymentHash,
        amount: formattedAmount,
        merchantId,
    });
});
// ---------------------------------------------------------
// PayHere Payment Notification Webhook
// ---------------------------------------------------------
exports.handlePayHereNotify = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig, payment_id, } = req.body;
    const merchantSecret = process.env.MERCHANT_SECRET;
    const secretHash = (0, md5_1.default)(merchantSecret).toUpperCase();
    const localSig = (0, md5_1.default)(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`).toUpperCase();
    // Validate signature
    if (localSig !== md5sig) {
        console.error("Invalid PayHere signature:", order_id);
        return res
            .status(400)
            .json({ success: false, message: "Invalid signature" });
    }
    // Payment success (status_code = 2)
    if (status_code === "2") {
        const order = await orderModel_1.default.findOne({ orderId: order_id });
        if (order) {
            order.orderStatus = "paid";
            order.paymentInfo = {
                id: payment_id || "manual",
                status: "Completed",
            };
            await order.save();
            console.log("Order updated as paid:", order_id);
        }
    }
    return res.status(200).json({ success: true });
});
