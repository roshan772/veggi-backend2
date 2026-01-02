import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import md5 from "md5";
import Order from "../models/orderModel";

// ---------------------------------------------------------
// Generate PayHere Hash (NO order creation here)
// ---------------------------------------------------------
export const generatePaymentHash = asyncHandler(
  async (req: Request, res: Response) => {
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

    const secretHash = md5(merchantSecret).toUpperCase();
    const paymentHash = md5(
      `${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`
    ).toUpperCase();

    return res.json({
      success: true,
      orderId,
      hash: paymentHash,
      amount: formattedAmount,
      merchantId,
    });
  }
);

// ---------------------------------------------------------
// PayHere Payment Notification Webhook
// ---------------------------------------------------------
export const handlePayHereNotify = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
    } = req.body;

    const merchantSecret = process.env.MERCHANT_SECRET!;
    const secretHash = md5(merchantSecret).toUpperCase();

    const localSig = md5(
      `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`
    ).toUpperCase();

    // Validate signature
    if (localSig !== md5sig) {
      console.error("Invalid PayHere signature:", order_id);
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Payment success (status_code = 2)
    if (status_code === "2") {
      const order = await Order.findOne({ orderId: order_id });

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
  }
);
