import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import "express-async-errors";
import { env, getConnectionStatus } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import adminRoutes from "./routes/admin/index.js";
import publicRoutes from "./routes/public/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");

const app = express();

// Behind a proxy (e.g. Render) trust the first hop so rate limits see the real client IP
app.set("trust proxy", 1);
app.disable("x-powered-by");

// CORS only matters when the front end is hosted on another origin.
// Same-origin requests (the production build served by this server) never hit it.
const allowedOrigins = new Set(env.CLIENT_URLS);
if (!env.IS_PRODUCTION) {
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://127.0.0.1:5173");
}
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  })
);

app.use(express.json({ limit: "100kb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    database: getConnectionStatus(),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

// Unknown API routes get a JSON 404 instead of an HTML page
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Serve the built React site (production, or local after `npm run build`)
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: "1d", index: false }));
  app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res
      .type("text/plain")
      .send("Maharashtra Dairy API is running. Start the site with `npm run dev` in client/ (port 5173).");
  });
}

// Error handler must be registered last
app.use(errorHandler);

export default app;
