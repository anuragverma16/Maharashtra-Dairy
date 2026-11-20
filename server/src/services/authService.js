import Admin from "../models/Admin.js";
import { createSession } from "./adminSessionService.js";

// Returns the raw session secret (sent only as an httpOnly cookie) plus the public admin profile
export const loginAdmin = async (email, password, meta = {}) => {
  if (!email || !password) {
    throw { status: 400, message: "Email and password are required." };
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin || !admin.isActive) {
    throw { status: 401, message: "Invalid email or password." };
  }

  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    throw { status: 401, message: "Invalid email or password." };
  }

  const sessionToken = await createSession(admin._id, meta);
  return { sessionToken, admin: admin.toJSON() };
};

export const getAdminProfile = async (adminId) => {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw { status: 404, message: "Admin not found" };
  }
  return admin.toJSON();
};
