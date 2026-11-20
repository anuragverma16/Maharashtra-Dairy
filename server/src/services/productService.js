import Product from "../models/Product.js";
import mongoose from "mongoose";
import products from "../data/products.js";
import { validateProductCategory } from "../config/db.js";
import { destroyImage } from "./cloudinaryService.js";

const httpError = (status, message) => Object.assign(new Error(message), { status });
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toText = (value) => (typeof value === "string" ? value.trim() : undefined);
const toList = (value) => {
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean);
  return undefined;
};
const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(400, "Invalid product ID");
};
const toBool = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "false") return value === "true";
  return undefined;
};
const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

// { url, publicId } from the upload endpoint; null removes the photo; anything else is ignored
const pickImage = (value) => {
  if (value === null) return null;
  if (value && typeof value === "object" && typeof value.url === "string" && typeof value.publicId === "string") {
    return { url: value.url.trim(), publicId: value.publicId.trim() };
  }
  return undefined;
};

// Only known product fields are written to the database
export const pickProductFields = (data = {}) => {
  const fields = {
    image: pickImage(data.image),
    name: toText(data.name),
    marathiName: toText(data.marathiName),
    category: toText(data.category),
    tagline: toText(data.tagline),
    sku: toText(data.sku),
    description: toText(data.description),
    price: toText(data.price),
    emoji: toText(data.emoji),
    benefits: toList(data.benefits),
    sizes: toList(data.sizes),
    badges: toList(data.badges),
    fatContent: toText(data.fatContent),
    shelfLife: toText(data.shelfLife),
    storage: toText(data.storage),
    packaging: toText(data.packaging),
    featured: toBool(data.featured),
    displayOrder: toNumber(data.displayOrder),
    available: toBool(data.available),
  };
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
};

const assertValidFields = (fields, { requireAll }) => {
  if (requireAll && (!fields.name || !fields.category)) {
    throw httpError(400, "Product name and category are required.");
  }
  if (fields.name === "") throw httpError(400, "Product name cannot be empty.");
  if (fields.category !== undefined && !validateProductCategory(fields.category)) {
    throw httpError(400, "Category must be milk or byproduct.");
  }
};

export const getAllProducts = async (filters = {}) => {
  const { search, category } = filters;
  const filter = {};

  if (category) filter.category = category;
  if (search) {
    const pattern = { $regex: escapeRegex(String(search).slice(0, 100)), $options: "i" };
    filter.$or = [{ name: pattern }, { marathiName: pattern }, { description: pattern }];
  }

  return await Product.find(filter).sort({ createdAt: -1 });
};

export const getProductById = async (id) => {
  assertId(id);

  const product = await Product.findById(id);
  if (!product) throw httpError(404, "Product not found");
  return product;
};

export const createProduct = async (productData) => {
  const fields = pickProductFields(productData);
  assertValidFields(fields, { requireAll: true });

  return await Product.create(fields);
};

export const updateProduct = async (id, productData) => {
  assertId(id);

  const fields = pickProductFields(productData);
  assertValidFields(fields, { requireAll: false });
  if (!Object.keys(fields).length) throw httpError(400, "Nothing to update");

  const before = await Product.findById(id);
  if (!before) throw httpError(404, "Product not found");

  const product = await Product.findByIdAndUpdate(id, fields, { new: true, runValidators: true });

  // Replaced or removed photo: delete the old file from Cloudinary
  const oldPublicId = before.image?.publicId;
  if (oldPublicId && fields.image !== undefined && fields.image?.publicId !== oldPublicId) {
    await destroyImage(oldPublicId);
  }

  return product;
};

export const deleteProduct = async (id) => {
  assertId(id);

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw httpError(404, "Product not found");

  await destroyImage(product.image?.publicId);
  return product;
};

export const getDashboardStats = async () => {
  const [total, available] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ available: { $ne: false } }),
  ]);

  return {
    totalProducts: total,
    availableProducts: available,
    unavailableProducts: total - available,
  };
};

// Public list comes from the database. The built-in catalogue is only a fallback
// for when the database cannot be reached.
export const getPublicProducts = async (category) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const filter = category ? { category } : {};
      return await Product.find(filter).sort({ displayOrder: 1, createdAt: 1 });
    }
  } catch (err) {
    console.error("Error fetching products from DB:", err.message);
  }

  return category ? products.filter((p) => p.category === category) : products;
};
