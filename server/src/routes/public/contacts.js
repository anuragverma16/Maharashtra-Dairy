import express from "express";
import rateLimit from "express-rate-limit";
import * as contactController from "../../controllers/public/contactController.js";

const router = express.Router();

// Stops floods of enquiries from one IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { success: false, message: "Too many messages sent from this network. Please try again later or call us." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", contactLimiter, contactController.createContact);

export default router;
