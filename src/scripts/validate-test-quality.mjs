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
const strictChecksMatch = contracts.match(/const\s+strictChecks\s*=\s*\[([^\]]+)\]\s+as const/);
if (!strictChecksMatch) {
  fail("Canonical tool test contract must define strictChecks as a readonly tuple.");
} else {
  const strictChecks = strictChecksMatch[1].match(/["']([^"']+)["']/g)?.map((value) => value.slice(1, -1)) ?? [];
  for (const check of requiredChecks) if (!strictChecks.includes(check)) fail(`Canonical strictChecks is missing required check: ${check}`);
  if (strictChecks.length !== requiredChecks.length) fail(`Canonical strictChecks must contain exactly: ${requiredChecks.join(", ")}`);
}

const contractEntries = [...contracts.matchAll(/\{\s*toolId:\s*["']([^"']+)["'][\s\S]*?requiredChecks:\s*([A-Za-z0-9_]+)/g)].map((match) => ({ id: match[1], checksRef: match[2] }));
for (const id of ["zip-creator", "archive-extractor", "file-splitter", "metadata-viewer"]) {
  const entry = contractEntries.find((candidate) => candidate.id === id);
  if (!entry) fail(`Missing test contract: ${id}`);
  else if (entry.checksRef !== "strictChecks") fail(`Tool ${id} must use canonical strictChecks; found ${entry.checksRef}.`);
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
