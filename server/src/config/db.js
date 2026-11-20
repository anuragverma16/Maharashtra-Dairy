import dns from "node:dns";

// MongoDB Atlas DNS fix
dns.setServers(["8.8.8.8", "8.8.4.4"]);





import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Always load server/.env, no matter which folder the process was started from
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ==================== ENVIRONMENT VARIABLES ====================
const splitList = (value = "") => value.split(",").map((s) => s.trim()).filter(Boolean);

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION,
  PORT: Number(process.env.PORT) || 5002,
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "24h",
  // Cloudinary (product photos). Keys come from server/.env only, never the browser.
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  // Admin sign-in lasts this many hours after the last activity (renewed while in use)
  SESSION_TTL_HOURS: Number(process.env.SESSION_TTL_HOURS) || 12,
  CLIENT_URL,
  // Comma-separated list of front-end origins allowed to call the API
  CLIENT_URLS: splitList(CLIENT_URL),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@maharashtradairy.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123456",
  ADMIN_NAME: process.env.ADMIN_NAME || "Administrator",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};

if (!env.JWT_SECRET) {
  if (IS_PRODUCTION) {
    throw new Error("JWT_SECRET must be set in production (see server/.env.example)");
  }
  env.JWT_SECRET = "dev-only-secret-change-me";
  console.warn("⚠️  JWT_SECRET is not set. Using an insecure development secret.");
}

// ==================== CONSTANTS ====================
export const ADMIN_ROLES = {
  ADMIN: "admin",
  SUPERADMIN: "superadmin"
};

export const PRODUCT_CATEGORIES = {
  MILK: "milk",
  BYPRODUCT: "byproduct"
};

export const SITE_SECTIONS = {
  HOME: "home",
  ABOUT: "about",
  QUALITY: "quality",
  CONTACT: "contact"
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  INVALID_CREDENTIALS: "Invalid email or password",
  NOT_FOUND: "Resource not found",
  INVALID_INPUT: "Invalid input provided",
  SERVER_ERROR: "Internal server error"
};

// ==================== MONGOOSE CONFIGURATION ====================
export const mongooseConfig = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

// ==================== DATABASE CONNECTION ====================
export const connectDB = async () => {
  try {
    if (!env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    const conn = await mongoose.connect(env.MONGO_URI, mongooseConfig);

    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Database: ${conn.connection.name}`);

    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// ==================== DATABASE UTILITIES ====================
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const getConnectionStatus = () => {
  const states = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };
  return states[mongoose.connection.readyState] || "Unknown";
};

export const getDBInfo = () => {
  return {
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    state: getConnectionStatus(),
    isConnected: isDBConnected(),
    readyState: mongoose.connection.readyState,
  };
};

export const pingDB = async () => {
  if (!isDBConnected()) {
    throw new Error("Database is not connected");
  }
  try {
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    return true;
  } catch (err) {
    return false;
  }
};

export const getDBStats = async () => {
  if (!isDBConnected()) {
    throw new Error("Database is not connected");
  }
  try {
    const admin = mongoose.connection.db.admin();
    const stats = await admin.serverStatus();
    return {
      uptime: stats.uptime,
      connections: stats.connections,
      operations: stats.opcounters,
    };
  } catch (err) {
    throw new Error("Failed to fetch database stats: " + err.message);
  }
};

export const reconnectDB = async () => {
  try {
    if (isDBConnected()) {
      return { success: true, message: "Already connected" };
    }
    await mongoose.connect(env.MONGO_URI, mongooseConfig);
    return { success: true, message: "Reconnected to database" };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// ==================== CONNECTION EVENT HANDLERS ====================
export const setupConnectionEvents = () => {
  mongoose.connection.on("connected", () => {
    console.log("✅ Mongoose connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  Mongoose disconnected from MongoDB");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 Mongoose reconnected to MongoDB");
  });

  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log("👋 Mongoose connection closed due to app termination");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error closing connection:", err);
      process.exit(1);
    }
  });
};

// ==================== VALIDATION FUNCTIONS ====================
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  return { valid: true, message: "Password is valid" };
};

export const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const validateProductCategory = (category) => {
  return Object.values(PRODUCT_CATEGORIES).includes(category);
};

export const validateSiteSection = (section) => {
  return Object.values(SITE_SECTIONS).includes(section);
};

export const validateAdminRole = (role) => {
  return Object.values(ADMIN_ROLES).includes(role);
};

export const validateContactForm = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) errors.push("Name is required");
  if (!data.email || !validateEmail(data.email)) errors.push("Valid email is required");
  if (!data.message || data.message.trim().length === 0) errors.push("Message is required");
  return { valid: errors.length === 0, errors };
};

export const validateProduct = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) errors.push("Product name is required");
  if (!data.category || !validateProductCategory(data.category)) {
    errors.push("Valid product category is required (milk or byproduct)");
  }
  return { valid: errors.length === 0, errors };
};

// ==================== LOGGER ====================
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const getLogLevel = () => {
  return LOG_LEVELS[env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;
};

const getTimestamp = () => {
  return new Date().toISOString();
};

export const logger = {
  error: (message, data = null) => {
    if (getLogLevel() >= LOG_LEVELS.ERROR) {
      console.error(`❌ [${getTimestamp()}] [ERROR] ${message}`, data || "");
    }
  },
  warn: (message, data = null) => {
    if (getLogLevel() >= LOG_LEVELS.WARN) {
      console.warn(`⚠️  [${getTimestamp()}] [WARN] ${message}`, data || "");
    }
  },
  info: (message, data = null) => {
    if (getLogLevel() >= LOG_LEVELS.INFO) {
      console.info(`ℹ️  [${getTimestamp()}] [INFO] ${message}`, data || "");
    }
  },
  debug: (message, data = null) => {
    if (getLogLevel() >= LOG_LEVELS.DEBUG) {
      console.debug(`🐛 [${getTimestamp()}] [DEBUG] ${message}`, data || "");
    }
  },
  success: (message, data = null) => {
    console.log(`✅ [${getTimestamp()}] [SUCCESS] ${message}`, data || "");
  },
  request: (method, path, statusCode = null) => {
    const status = statusCode ? `${statusCode}` : "pending";
    console.log(`📡 [${getTimestamp()}] ${method} ${path} - ${status}`);
  },
};

// ==================== EXPORT EVERYTHING ====================
export default {
  // Environment & Constants
  env,
  ADMIN_ROLES,
  PRODUCT_CATEGORIES,
  SITE_SECTIONS,
  ERROR_MESSAGES,

  // Connection
  connectDB,
  setupConnectionEvents,
  mongooseConfig,

  // Database Utilities
  isDBConnected,
  getConnectionStatus,
  getDBInfo,
  pingDB,
  getDBStats,
  reconnectDB,

  // Validation
  validateEmail,
  validatePassword,
  validateObjectId,
  validateProductCategory,
  validateSiteSection,
  validateAdminRole,
  validateContactForm,
  validateProduct,

  // Logger
  logger,
};
