import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const srcDist = path.join(rootDir, "web-app", "dist");
const targetDist = path.join(rootDir, "dist");

try {
  if (fs.existsSync(srcDist)) {
    fs.cpSync(srcDist, targetDist, { recursive: true });
    console.log("Successfully synchronized web-app/dist to root /dist");
  } else {
    console.warn("Source web-app/dist directory not found.");
  }
} catch (err) {
  console.error("Error synchronizing dist directories:", err);
}
