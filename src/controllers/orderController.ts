import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import Order from "../models/orderModel";
import { AppError } from "../utils/AppError";
import  Product  from "../models/productModels";

// CREATE NEW ORDER
//http://localhost:8000/api/v1/order/new
export const createOrder = asyncHandler(async (req: any, res: Response) => {
  const {
    orderItems,
    shippingInfo,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
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
export const getSingleOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) throw new AppError("Order not found", 404);

    res.status(200).json({
      success: true,
      order,
    });
  }
);

//Get Logged User Order
//http://localhost:8000/api/v1/order/myorders
export const getMyOrders = asyncHandler(async (req: any, res: Response) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//******************************************************* */
//******************** ADMIN **************************** */
//******************************************************* */

//http://localhost:8000/api/v1/order/
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await Order.find();

    res.status(200).json({
      success: true,
      orders,
    });
  }
);

//Update Order
// UPDATE ORDER (ADMIN)http://localhost:8000/api/v1/order/6932745e1a5ffd0c19cc4caf
export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) throw new AppError("Order not found", 404);

  if (order.orderStatus === "Delivered") 
    throw new AppError("Order already delivered", 400);

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
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) throw new AppError("Order not found", 404);

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

// Reduce product stock
const updateStock = async (productId: string, quantity: number) => {
  const product = await Product.findById(productId);

  if (!product) return;

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
};
