// Central API client used by the public site and the admin panel.
// VITE_API_URL is empty when the site and API share an origin (the normal case),
// or the backend origin when the front end is hosted separately.
const RAW_BASE = import.meta.env.VITE_API_URL || "";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Admin sessions live in an httpOnly cookie, which the browser sends automatically.
// `credentials: "same-origin"` keeps it working through the Vite proxy and on the production server.
export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  const headers = { Accept: "application/json" };
  // FormData (file uploads) sets its own multipart Content-Type; plain objects are sent as JSON
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("We could not reach the server. Please check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // A 401 on an admin call (other than sign-in/out) means the session has expired
    const isSessionCall = /^\/api\/admin\/auth\/(login|logout)$/.test(path);
    if (res.status === 401 && path.startsWith("/api/admin/") && !isSessionCall) {
      window.dispatchEvent(new Event("admin:unauthorized"));
    }
    const message = data.message || data.error?.message || `Request failed (${res.status}).`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}
