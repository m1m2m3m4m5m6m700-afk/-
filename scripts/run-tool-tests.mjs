import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const testsDir = path.join(root, "tests", "tools");

if (!fs.existsSync(testsDir)) {
  console.log("Tool test gate: PASS (no promoted tools yet)");
  process.exit(0);
}

const testFiles = fs.readdirSync(testsDir).filter((file) => /\.(spec|test)\.(ts|tsx)$/.test(file));
if (testFiles.length === 0) {
  console.log("Tool test gate: PASS (no promoted tools yet)");
  process.exit(0);
}

const result = spawnSync(
  "npx",
  ["playwright", "test", "--config=playwright.tools.config.ts"],
  { stdio: "inherit", shell: process.platform === "win32" },
);
process.exit(result.status ?? 1);
