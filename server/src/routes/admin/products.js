import express from "express";
import { verifyAdminToken } from "../../middleware/auth.js";
import * as productController from "../../controllers/admin/productController.js";
import { uploadSingleImage, uploadProductImageHandler } from "../../controllers/admin/uploadController.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/stats", productController.getDashboardStats);
router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);
// Uploads one product photo to Cloudinary and returns { url, publicId }
router.post("/image", uploadSingleImage, uploadProductImageHandler);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
