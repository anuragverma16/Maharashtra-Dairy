import express from "express";
import { verifyAdminToken } from "../../middleware/auth.js";
import * as contactController from "../../controllers/admin/contactController.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/stats", contactController.getContactStats);
router.get("/", contactController.getAllContacts);
router.get("/:id", contactController.getContactById);
router.put("/:id", contactController.updateContact);
router.delete("/:id", contactController.deleteContact);

export default router;
