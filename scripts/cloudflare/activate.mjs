#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const live = process.argv.includes("--live");
const confirmed = process.env.CLOUDFLARE_ACTIVATE_CONFIRM === "YES";

if (!live) {
  console.log("Cloudflare activation is gated. Use --live only after the dashboard settings are corrected.");
  console.log("Required Build command: pnpm build:verified");
  console.log("Required Deploy command: pnpm deploy:raw");
  process.exit(0);
}

if (!confirmed) {
  console.error("Refusing live activation: set CLOUDFLARE_ACTIVATE_CONFIRM=YES explicitly.");
  process.exit(1);
}

const result = spawnSync("pnpm", ["deploy"], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(result.status ?? 1);
