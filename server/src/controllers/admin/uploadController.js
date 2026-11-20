import multer from "multer";
import { MAX_IMAGE_BYTES, uploadProductImage } from "../../services/cloudinaryService.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } });

// Multipart field name: "image"
export const uploadSingleImage = (req, res, next) =>
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 5 MB." : "Could not read the uploaded file.";
    res.status(400).json({ success: false, message });
  });

export const uploadProductImageHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Choose an image to upload." });
    }
    const image = await uploadProductImage(req.file.buffer, req.file.mimetype);
    res.status(201).json({ success: true, message: "Image uploaded", data: image });
  } catch (err) {
    next(err);
  }
};
