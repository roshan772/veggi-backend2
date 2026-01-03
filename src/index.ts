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

/* ---------------- CORS ---------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL, // https://veggi-inc.vercel.app
  "http://localhost:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


/* ---------------- BODY PARSERS ---------------- */
app.use(express.json({ limit: "10mb" })); // JSON bodies (existing)
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // ← Form-encoded bodies (new - prevents req.body undefined)
app.use(cookieParser());

/* ---------------- STATIC FILES ---------------- */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, path) => {
      res.set("Access-Control-Allow-Origin", "http://localhost:5173"); // Frontend origin
      res.set("Access-Control-Allow-Methods", "GET");
    },
  })
);

/* ---------------- ROUTES ---------------- */
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);


/* ---------------- HEALTH CHECK (IMPORTANT) ---------------- */
app.get("/", (_req, res) => {
  res.status(200).send("API is running");
});

/* ---------------- ERROR HANDLER ---------------- */
app.use(errorHandler);

/* ---------------- START SERVER SAFELY ---------------- */
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const PORT = process.env.PORT;
    if (!PORT) {
      throw new Error("PORT not provided by Railway");
    }

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1); // 🔥 REQUIRED for Railway
  }
};

startServer();
