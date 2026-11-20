import express from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../../controllers/admin/authController.js";
import { verifyAdminToken } from "../../middleware/auth.js";

const router = express.Router();

// At most 5 sign-in attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, authController.loginAdmin);
router.get("/me", verifyAdminToken, authController.getAdminProfile);
router.post("/logout", verifyAdminToken, authController.logoutAdmin);

export default router;
