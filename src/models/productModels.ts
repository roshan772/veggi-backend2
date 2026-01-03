import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  ratings: number;
  images: { image: string; public_id: string }[];
  category: string;
  unitType: "kg" | "g" | "piece" | "bunch";
  stock: number;
  freshness: string;
  origin: string;
  seller: string;
  numOfReviews: number;
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
  }[];
  user: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
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
        image: { type: String, required: true }, // Cloudinary URL
        public_id: { type: String, required: true }, // Cloudinary public id
      },
    ],
    default: [],
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
        type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
