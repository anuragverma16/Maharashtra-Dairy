import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/db.js";

const PRODUCT_FOLDER = "maharashtra-dairy/products";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const isCloudinaryConfigured = () =>
  Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

// Configure once; the API secret stays on the server and is never sent to the browser
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// expose: the message is safe to show the admin (it is not an internal failure)
const httpError = (status, message) => Object.assign(new Error(message), { status, expose: true });

export async function uploadProductImage(buffer, mimetype) {
  if (!isCloudinaryConfigured()) {
    throw httpError(503, "Image upload is not configured. Add the Cloudinary keys to server/.env.");
  }
  if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    throw httpError(400, "Only JPG, PNG or WebP images are allowed.");
  }
  if (!buffer?.length || buffer.length > MAX_IMAGE_BYTES) {
    throw httpError(400, "Image must be smaller than 5 MB.");
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: PRODUCT_FOLDER, resource_type: "image" },
      (err, data) => {
        if (err) {
          console.error("Cloudinary upload failed:", err.message);
          return reject(httpError(502, "Cloudinary rejected the upload. Check the Cloudinary keys in server/.env."));
        }
        resolve(data);
      }
    );
    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

// Best effort: a failed cleanup must never block saving the product
export async function destroyImage(publicId) {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.error("Could not delete Cloudinary image:", publicId, err.message);
  }
}
