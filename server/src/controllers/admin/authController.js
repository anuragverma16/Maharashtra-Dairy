import * as authService from "../../services/authService.js";
import {
  SESSION_COOKIE,
  destroySession,
  readSessionCookie,
  sessionCookieOptions,
} from "../../services/adminSessionService.js";

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { sessionToken, admin } = await authService.loginAdmin(email, password, {
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });
    res.cookie(SESSION_COOKIE, sessionToken, sessionCookieOptions());
    res.json({ success: true, message: "Login successful", admin });
  } catch (err) {
    next(err);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await authService.getAdminProfile(req.adminId);
    res.json({ success: true, admin });
  } catch (err) {
    next(err);
  }
};

export const logoutAdmin = async (req, res, next) => {
  try {
    await destroySession(readSessionCookie(req));
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.json({ success: true, message: "Logout successful" });
  } catch (err) {
    next(err);
  }
};
