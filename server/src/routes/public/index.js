import express from "express";
import productRoutes from "./products.js";
import contactRoutes from "./contacts.js";

const router = express.Router();

router.use("/products", productRoutes);
router.use("/contact", contactRoutes);

export default router;
