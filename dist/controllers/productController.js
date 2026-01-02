"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getSingleProduct = exports.createProduct = exports.getProducts = void 0;
const productModels_1 = __importDefault(require("../models/productModels"));
const AppError_1 = require("../utils/AppError");
const asyncHandler_1 = require("../middlewares/asyncHandler");
//Get All Products:/api/v1/products
//GET /api/products?search=carrot&category=leafy&minPrice=50&maxPrice=200&page=1&limit=10
exports.getProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search = "", category, minPrice, maxPrice, page = 1, limit = 10, } = req.query;
    const query = {};
    //Search by name
    if (search) {
        query.name = { $regex: search, $options: "i" };
    }
    //  Filter by category
    if (category) {
        query.category = category;
    }
    //  Price filter
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice)
            query.price.$gte = Number(minPrice);
        if (maxPrice)
            query.price.$lte = Number(maxPrice);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const products = await productModels_1.default.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
    const total = await productModels_1.default.countDocuments(query);
    return res.status(200).json({
        success: true,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        products,
    });
});
//Create a new Product:/api/v1/products/new
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const files = req.files;
    if (!files || files.length === 0) {
        throw new AppError_1.AppError("Please upload at least one image", 400);
    }
    const imageUrls = files.map((file) => ({
        image: `/uploads/products/${file.filename}`,
    }));
    const product = await productModels_1.default.create({
        ...body,
        images: imageUrls,
    });
    res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
    });
});
//Get Single Products : http://localhost:8000/api/v1/products/691dca3211e215063266d38a
exports.getSingleProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await productModels_1.default.findById(req.params.id);
    if (!product)
        throw new AppError_1.AppError("Product not found", 404);
    return res.status(200).json({
        success: true,
        product,
    });
});
//Update Product : http://localhost:8000/api/v1/products/691dca3211e215063266d38a
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const existingProduct = await productModels_1.default.findById(req.params.id);
    if (!existingProduct)
        throw new AppError_1.AppError("Product not found", 404);
    const body = req.body;
    const files = req.files;
    let updatedImages = [];
    if (existingProduct.images && Array.isArray(existingProduct.images)) {
        updatedImages = existingProduct.images;
    }
    // Add new uploaded images
    if (files && files.length > 0) {
        const newImages = files.map((file) => ({
            image: `/uploads/products/${file.filename}`,
        }));
        updatedImages = [...updatedImages, ...newImages];
    }
    // If frontend sends full images list
    if (body.images && typeof body.images === "string") {
        try {
            updatedImages = JSON.parse(body.images);
        }
        catch (err) {
            console.log("Invalid images JSON – ignoring");
        }
    }
    const updateData = {
        ...body,
        images: updatedImages,
    };
    const product = await productModels_1.default.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
    });
});
//Delete Product : http://localhost:8000/api/v1/products/691dca3211e215063266d38a
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await productModels_1.default.findByIdAndDelete(req.params.id);
    if (!product)
        throw new AppError_1.AppError("Product not found", 404);
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});
