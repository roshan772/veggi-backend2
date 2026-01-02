"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middlewares/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const path_1 = __importDefault(require("path"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
dotenv_1.default.config({ path: "./src/config/config.env" });
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200, // ← This ensures preflight succeeds (common 404 fix)
}));
app.use(express_1.default.json({ limit: "10mb" })); // JSON bodies (existing)
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" })); // ← Form-encoded bodies (new - prevents req.body undefined)
app.use((0, cookie_parser_1.default)());
// Edited: Serve uploads with CORS (key fix - allows frontend to fetch images)
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads"), {
    setHeaders: (res, path) => {
        res.set("Access-Control-Allow-Origin", "http://localhost:5173"); // Frontend origin
        res.set("Access-Control-Allow-Methods", "GET");
    },
}));
app.use("/api/v1/products", productRoutes_1.default);
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/order", orderRoutes_1.default);
app.use("/api/v1/payments", paymentRoutes_1.default);
app.use(errorHandler_1.errorHandler);
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => `Mongo DB Connection Fail ${err}`);
// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV}`);
});
