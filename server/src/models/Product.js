import mongoose from "mongoose";
import { PRODUCT_CATEGORIES } from "../config/db.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    marathiName: String,
    category: { type: String, enum: Object.values(PRODUCT_CATEGORIES), required: true },
    description: String,
    benefits: [String],
    sizes: [String],
    tagline: String, // one-line summary shown on the product card
    sku: String, // internal product code, e.g. MD-MLK-001
    price: String,
    emoji: String,
    image: { url: String, publicId: String }, // Cloudinary photo
    fatContent: String, // e.g. "4.5% min"
    shelfLife: String, // e.g. "24 hours refrigerated"
    storage: String, // e.g. "Keep at 2–4 °C"
    packaging: String, // e.g. "HDPE bottle"
    badges: [String], // e.g. "Farm fresh", "No preservatives"
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
