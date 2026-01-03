import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    return {
      folder: "veggi", // folder name in Cloudinary
      resource_type: "image",
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
    };
  },
});

export const uploadCloudinary = multer({ storage });
