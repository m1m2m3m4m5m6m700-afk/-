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

for (const file of await walk("src/lib/tool-runtime")) {
  const source = await readFile(file, "utf8");
  if (/\beval\s*\(/.test(source) || /\bnew\s+Function\s*\(/.test(source)) fail(`Dynamic code execution forbidden: ${file}`);
  if (/dangerouslySetInnerHTML|\.innerHTML\s*=/.test(source)) fail(`Raw HTML injection surface: ${file}`);
}

const registry = await readFile("src/config/tools.ts", "utf8");
const publicCount = (registry.match(/isReady:\s*true/g) ?? []).length;
const localOnlyCount = (registry.match(/localOnly:\s*true/g) ?? []).length;
if (publicCount === 0) fail("No ready tool registrations found in the central registry.");
if (publicCount !== localOnlyCount) fail("Every ready public tool must be declared localOnly=true.");

if (failures.length) {
  console.error("SECURITY GATE: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("SECURITY GATE: PASS");
