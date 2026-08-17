import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const assetDir = path.resolve(root, "web-app/dist/public");
const indexPath = path.join(assetDir, "index.html");
const wranglerPath = path.resolve(root, "wrangler.jsonc");

function fail(message) {
  console.error(`\nDEPLOYMENT PREFLIGHT FAILED\n${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(wranglerPath)) {
  fail(`Expected Wrangler configuration at ${wranglerPath}.`);
}

if (!fs.existsSync(assetDir)) {
  fail(`BUILD ARTIFACT MISSING\nExpected: ${assetDir}\nRun: pnpm build`);
}

if (!fs.existsSync(indexPath)) {
  fail(`ENTRYPOINT MISSING\nExpected: ${indexPath}\nRun: pnpm build`);
}

const files = fs.readdirSync(assetDir, { recursive: true });
if (files.length === 0) {
  fail(`BUILD ARTIFACT EMPTY\nExpected non-empty directory: ${assetDir}`);
}

const config = fs.readFileSync(wranglerPath, "utf8");
if (!config.includes("./web-app/dist/public")) {
  fail("WRANGLER ASSET PATH MISMATCH\nExpected wrangler.jsonc to reference ./web-app/dist/public.");
}

console.log(`Preflight passed: ${files.length} asset entries found in ${path.relative(root, assetDir)}.`);
