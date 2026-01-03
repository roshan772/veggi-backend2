import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const safeName = file.originalname
      .replace(/\.[^/.]+$/, "") // remove extension
      .replace(/\s+/g, "-") // spaces -> dash
      .replace(/[^\w-]/g, ""); // remove weird chars

    return {
      folder: "veggi/products",
      resource_type: "image",
      public_id: `${Date.now()}-${safeName}`, // ✅ THIS becomes file.filename
    };
  },
});

export const uploadCloudinary = multer({ storage });
