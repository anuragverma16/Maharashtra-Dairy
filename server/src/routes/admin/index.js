import express from "express";
import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import contactRoutes from "./contacts.js";
import contentRoutes from "./content.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/contacts", contactRoutes);
router.use("/content", contentRoutes);

export default router;
