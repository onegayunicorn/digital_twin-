import { spawnSync } from "node:child_process";

const result = spawnSync("pnpm", ["--dir", "web-app", "build"], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const preflight = spawnSync("node", ["scripts/identity-forge-v2/preflight.mjs"], {
  cwd: process.cwd(),
  stdio: "inherit",
});
process.exit(preflight.status ?? 1);
