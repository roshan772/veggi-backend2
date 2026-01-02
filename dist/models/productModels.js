"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter vegetable name"],
        trim: true,
        maxLength: [100, "Name cannot exceed 100 characters"],
    },
    price: {
        type: Number,
        required: [true, "Please enter vegetable price"],
        default: 0.0,
    },
    description: {
        type: String,
        required: [true, "Please enter vegetable description"],
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: {
        type: [
            {
                image: { type: String, required: true },
            },
        ],
        default: [], // ← IMPORTANT FIX
    },
    category: {
        type: String,
        required: [true, "Please enter vegetable category"],
        enum: {
            values: [
                "Leafy Vegetables",
                "Root Vegetables",
                "Gourds",
                "Fruits Vegetables",
                "Beans & Peas",
                "Herbs",
                "Tubers",
                "Organic Vegetables",
            ],
            message: "Please select a valid vegetable category",
        },
    },
    unitType: {
        type: String,
        enum: ["kg", "g", "piece", "bunch"],
        required: [true, "Please select unit type"],
    },
    stock: {
        type: Number,
        required: [true, "Please enter vegetable stock"],
        maxLength: [1000, "Stock limit exceeded"],
    },
    freshness: {
        type: String,
        default: "Fresh",
    },
    origin: {
        type: String,
        default: "Local Farm",
    },
    seller: {
        type: String,
        required: [true, "Please enter seller name"],
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
