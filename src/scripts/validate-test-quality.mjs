import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const failures = [];
const fail = (message) => failures.push(message);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === ".output") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.(ts|tsx|mjs|js)$/.test(path)) files.push(path);
  }
  return files;
}

const testFiles = await walk("tests");
for (const file of testFiles) {
  const source = await readFile(file, "utf8");
  if (/\b(?:test|it|describe)\.only\s*\(/.test(source)) fail(`Focused test is forbidden: ${file}`);
  if (/\b(?:test|it|describe)\.(?:skip|fixme)\s*\(/.test(source)) fail(`Skipped/fixme test is forbidden: ${file}`);
  if (/\btest\s*\([^\n]*,\s*async?\s*\([^)]*\)\s*=>\s*\{[^}]*\}\s*\)/s.test(source) && !source.includes("expect(")) {
    fail(`Test file contains test bodies without assertions: ${file}`);
  }
}

const contracts = await readFile("src/lib/tool-platform/testContracts.ts", "utf8");
const requiredChecks = ["render", "interaction", "output", "error"];
for (const id of ["zip-creator", "archive-extractor", "file-splitter", "metadata-viewer"]) {
  const start = contracts.indexOf(`toolId: "${id}"`);
  if (start < 0) fail(`Missing test contract: ${id}`);
  else {
    const block = contracts.slice(start, start + 260);
    for (const check of requiredChecks) if (!block.includes(`"${check}"`)) fail(`Tool ${id} missing required check: ${check}`);
  }
}

const playwright = await readFile("playwright.config.ts", "utf8");
for (const required of ["trace: \"retain-on-failure\"", "reuseExistingServer: false", "fullyParallel: false"]) {
  if (!playwright.includes(required)) fail(`Playwright isolation/diagnostics rule missing: ${required}`);
}

if (failures.length) {
  console.error("TEST QUALITY CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("TEST QUALITY CONTRACT: PASS");
