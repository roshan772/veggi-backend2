import { Request, Response } from "express";
import Product from "../models/productModels";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";

//Get All Products:/api/v1/products
//GET /api/products?search=carrot&category=leafy&minPrice=50&maxPrice=200&page=1&limit=10
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    search = "",
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
  } = req.query;
  const query: any = {};

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
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(query);
  return res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    products,
  });
});

//Create a new Product:/api/v1/products/new
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body;
    const files = req.files as any[]; // Cloudinary adds fields, so "any" is easiest

    if (!files || files.length === 0) {
      throw new AppError("Please upload at least one image", 400);
    }

    const imageUrls = files.map((file) => ({
      image: file.path,
      public_id: file.filename || file.public_id, // ✅ CHANGED: fallback if filename is missing
    }));

    if (imageUrls.some((img) => !img.public_id)) {
      console.log("FILES DEBUG:", files[0]);
      throw new AppError(
        "Cloudinary upload missing public_id (check uploadCloudinary middleware)",
        500
      );
    }

    const product = await Product.create({
      ...body,
      images: imageUrls,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  }
);


//Get Single Products : http://localhost:8000/api/v1/products/691dca3211e215063266d38a
export const getSingleProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError("Product not found", 404);

    return res.status(200).json({
      success: true,
      product,
    });
  }
);

//Update Product : http://localhost:8000/api/v1/products/691dca3211e215063266d38a
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) throw new AppError("Product not found", 404);

    const body = req.body;
    const files = req.files as any[];

    let updatedImages: any[] = [];

    if (existingProduct.images && Array.isArray(existingProduct.images)) {
      updatedImages = existingProduct.images;
    }

    // Add new uploaded images
    if (files && files.length > 0) {
      const newImages = files.map((file) => ({
        image: file.path,
        public_id: file.filename || file.public_id, // ✅ CHANGED: fallback if filename is missing
      }));
      updatedImages = [...updatedImages, ...newImages];
    }

    // If frontend sends full images list
    if (body.images && typeof body.images === "string") {
      try {
        updatedImages = JSON.parse(body.images);
      } catch (err) {
        console.log("Invalid images JSON – ignoring");
      }
    }

    const updateData = {
      ...body,
      images: updatedImages,
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  }
);

//Delete Product : http://localhost:8000/api/v1/products/691dca3211e215063266d38a
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new AppError("Product not found", 404);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);
