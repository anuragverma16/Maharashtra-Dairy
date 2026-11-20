import mongoose from "mongoose";

// One row per signed-in browser. Only a SHA-256 hash of the session secret is stored,
// so a leaked database cannot be used to hijack a live session.
const adminSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    userAgent: String,
    ip: String,
    lastSeenAt: { type: Date, default: Date.now },
    // MongoDB removes expired sessions automatically (TTL index)
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model("AdminSession", adminSessionSchema);
