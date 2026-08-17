import { spawnSync } from "node:child_process";

const preflight = spawnSync("node", ["scripts/identity-forge-v2/preflight.mjs"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (preflight.status !== 0) {
  process.exit(preflight.status ?? 1);
}

const deploy = spawnSync("pnpm", ["exec", "wrangler", "deploy"], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(deploy.status ?? 1);
