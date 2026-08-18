import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const webAppDir = path.join(rootDir, "web-app");

console.log("[Build Pipeline] Starting production build for web-app...");

try {
  execSync("npm --prefix web-app run build", {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });

  const srcDist = path.join(webAppDir, "dist");
  const targetDist = path.join(rootDir, "dist");

  if (fs.existsSync(srcDist)) {
    fs.cpSync(srcDist, targetDist, { recursive: true });
    console.log("[Build Pipeline] Build and synchronization to /dist complete.");
  }
} catch (error) {
  console.error("[Build Pipeline] Build failed:", error);
  process.exit(1);
}
