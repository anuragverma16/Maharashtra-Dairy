import express from "express";
import * as productController from "../../controllers/public/productController.js";

const router = express.Router();

router.get("/", productController.getAllProducts);

export default router;
