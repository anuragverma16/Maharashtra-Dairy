import express from "express";
import { verifyAdminToken } from "../../middleware/auth.js";
import * as contentController from "../../controllers/admin/contentController.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/", contentController.getAllContent);
router.get("/:section", contentController.getContentBySection);
router.put("/:section", contentController.updateContent);

export default router;
