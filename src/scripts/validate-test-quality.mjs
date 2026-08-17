import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const failures = [];
const fail = (message) => failures.push(message);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (["node_modules", ".git", "dist", ".output"].includes(entry.name)) continue;
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
}

const contracts = await readFile("src/lib/tool-platform/testContracts.ts", "utf8");
const requiredChecks = ["render", "interaction", "output", "error"];
const usesCanonicalStrictChecks = /const strictChecks\s*=\s*\[\s*["']render["']\s*,\s*["']interaction["']\s*,\s*["']output["']\s*,\s*["']error["']\s*\]\s+as const/.test(contracts);
if (!usesCanonicalStrictChecks) fail("Canonical tool test contract must define strictChecks = render, interaction, output, error.");

const contractEntries = [...contracts.matchAll(/\{\s*toolId:\s*["']([^"']+)["'][\s\S]*?requiredChecks:\s*([A-Za-z0-9_]+)/g)].map((match) => ({ id: match[1], checksRef: match[2] }));
for (const id of ["zip-creator", "archive-extractor", "file-splitter", "metadata-viewer"]) {
  const entry = contractEntries.find((candidate) => candidate.id === id);
  if (!entry) {
    fail(`Missing test contract: ${id}`);
    continue;
  }
  if (entry.checksRef !== "strictChecks") {
    const start = contracts.indexOf(`toolId: "${id}"`);
    const block = contracts.slice(start, start + 350);
    for (const check of requiredChecks) if (!block.includes(`"${check}"`)) fail(`Tool ${id} missing required check: ${check}`);
  }
}

const playwright = await readFile("playwright.config.ts", "utf8");
for (const required of ["trace: \"retain-on-failure\"", "reuseExistingServer: false", "fullyParallel: false"]) {
  if (!playwright.includes(required)) fail(`Playwright isolation/diagnostics rule missing: ${required}`);
}

if (failures.length) {
  console.error("TEST QUALITY CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`);
  process.exit(1);
}

console.log("TEST QUALITY CONTRACT: PASS");
