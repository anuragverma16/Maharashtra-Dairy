import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../client/dist");

console.log(`Checking if client build exists at: ${distPath}`);

if (!fs.existsSync(distPath)) {
  console.log("⚙️  Client build not found. Building...");
  try {
    execSync("cd ../client && npm install && npm run build", {
      cwd: __dirname,
      stdio: "inherit",
    });
    console.log("✅ Client built successfully");
  } catch (err) {
    console.error("❌ Failed to build client:", err.message);
    process.exit(1);
  }
} else {
  console.log("✅ Client build found, skipping build");
}

// Start the server
import("./server.js");
