import mongoose from "mongoose";
import { SITE_SECTIONS } from "../config/db.js";

const siteContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: Object.values(SITE_SECTIONS),
      unique: true,
      required: true,
    },
    // Empty text is a valid value (a section can be cleared), so no `required` here
    content: { type: String, default: "" },
    lastUpdatedBy: String,
  },
  { timestamps: true }
);

export default mongoose.model("SiteContent", siteContentSchema);
