import { env } from "../config/db.js";

// One error shape for the whole API:
// { success: false, message, error: { status, message } }
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = Number(err.status || err.statusCode) || 500;
  let message = err.message || "Something went wrong";

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Request body is not valid JSON";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(". ");
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for "${err.path}"`;
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with the same unique value already exists";
  }

  if (status >= 500 && !err.expose) {
    console.error("❌ Unhandled error:", err);
    message = "Internal server error. Please try again later.";
  }

  res.status(status).json({
    success: false,
    message,
    error: {
      status,
      message,
      ...(env.NODE_ENV === "development" && status >= 500 && { stack: err.stack }),
    },
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
