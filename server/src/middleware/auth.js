import Admin from "../models/Admin.js";
import {
  SESSION_COOKIE,
  findActiveSession,
  readSessionCookie,
  renewSession,
  sessionCookieOptions,
  destroySession,
} from "../services/adminSessionService.js";

const sessionExpired = (res) =>
  res.status(401).json({ success: false, message: "Your session has expired. Please log in again." });

// Every /api/admin route (except login) requires a valid server-side session cookie
export const verifyAdminToken = async (req, res, next) => {
  try {
    const raw = readSessionCookie(req);
    const session = await findActiveSession(raw);
    if (!session) {
      res.clearCookie(SESSION_COOKIE, { path: "/" });
      return sessionExpired(res);
    }

    const admin = await Admin.findById(session.adminId);
    if (!admin || !admin.isActive) {
      await destroySession(raw);
      res.clearCookie(SESSION_COOKIE, { path: "/" });
      return sessionExpired(res);
    }

    if (await renewSession(session)) {
      res.cookie(SESSION_COOKIE, raw, sessionCookieOptions());
    }

    req.adminId = String(admin._id);
    req.adminEmail = admin.email;
    req.adminRole = admin.role;
    next();
  } catch (err) {
    next(err);
  }
};
