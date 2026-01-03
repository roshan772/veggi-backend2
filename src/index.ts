import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";

import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import path from "path";
import paymentRoutes from "./routes/paymentRoutes";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL, "http://localhost:5173"]
      : "http://localhost:5173", // Edited: Array for prod (Vercel) + dev; split if comma-separated
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "10mb" })); // JSON bodies (existing)
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // ← Form-encoded bodies (new - prevents req.body undefined)
app.use(cookieParser());

// Edited: Serve uploads with CORS (key fix - allows frontend to fetch images)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, path) => {
      res.set("Access-Control-Allow-Origin", "http://localhost:5173"); // Frontend origin
      res.set("Access-Control-Allow-Methods", "GET");
    },
  })
);

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.use(errorHandler);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => `Mongo DB Connection Fail ${err}`);

// Start Server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV}`
  );
});
