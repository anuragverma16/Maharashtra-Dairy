import crypto from "node:crypto";
import AdminSession from "../models/AdminSession.js";
import { env } from "../config/db.js";

export const SESSION_COOKIE = "md_admin_session";
const SESSION_TTL_MS = env.SESSION_TTL_HOURS * 60 * 60 * 1000;
const RENEW_AFTER_MS = 5 * 60 * 1000; // slide the expiry at most once every 5 minutes

const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");
const ttlDate = () => new Date(Date.now() + SESSION_TTL_MS);

export const sessionCookieOptions = () => ({
  httpOnly: true, // JavaScript on the page can never read the session
  sameSite: "lax",
  secure: env.IS_PRODUCTION,
  path: "/",
  maxAge: SESSION_TTL_MS,
});

// Reads our cookie from the raw header (no cookie-parser dependency needed)
export const readSessionCookie = (req) => {
  for (const part of (req.headers.cookie || "").split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === SESSION_COOKIE) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return null;
};

export async function createSession(adminId, { userAgent, ip } = {}) {
  const raw = crypto.randomBytes(32).toString("base64url");
  await AdminSession.create({
    tokenHash: hashToken(raw),
    adminId,
    userAgent: String(userAgent || "").slice(0, 200),
    ip: String(ip || "").slice(0, 64),
    lastSeenAt: new Date(),
    expiresAt: ttlDate(),
  });
  return raw;
}

export async function findActiveSession(raw) {
  if (!raw) return null;
  return AdminSession.findOne({ tokenHash: hashToken(raw), expiresAt: { $gt: new Date() } });
}

// Returns true when the expiry was extended (so the cookie should be re-issued)
export async function renewSession(session) {
  if (Date.now() - new Date(session.lastSeenAt).getTime() < RENEW_AFTER_MS) return false;
  session.lastSeenAt = new Date();
  session.expiresAt = ttlDate();
  await session.save();
  return true;
}

export async function destroySession(raw) {
  if (raw) await AdminSession.deleteOne({ tokenHash: hashToken(raw) });
}
