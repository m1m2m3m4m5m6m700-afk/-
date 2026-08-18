import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("test-results", "evidence");
const REQUIRED_TOOLS = new Set([
  "zip-creator",
  "archive-extractor",
  "file-splitter",
  "metadata-viewer",
]);

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(dir, entry.name));
}

const files = await collect(ROOT);
if (files.length === 0) {
  console.error("VERIFICATION EVIDENCE GATE: FAIL — no evidence files were produced.");
  process.exit(1);
}

const records = [];
for (const file of files) {
  let value;
  try {
    value = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    console.error(`VERIFICATION EVIDENCE GATE: invalid JSON: ${file}`);
    process.exitCode = 1;
    continue;
  }
  records.push({ file, value });
}

const passed = new Map();
for (const { file, value } of records) {
  const required = [
    "schemaVersion",
    "toolId",
    "testName",
    "status",
    "inputFingerprint",
    "expectedFingerprint",
    "actualFingerprint",
    "timestamp",
  ];
  const missing = required.filter((key) => value?.[key] === undefined || value?.[key] === "");
  if (missing.length) {
    console.error(`VERIFICATION EVIDENCE GATE: FAIL — ${file} missing ${missing.join(", ")}`);
    process.exitCode = 1;
    continue;
  }
  if (value.schemaVersion !== 1) {
    console.error(`VERIFICATION EVIDENCE GATE: FAIL — ${file} has unsupported schemaVersion.`);
    process.exitCode = 1;
  }
  if (value.status !== "passed") {
    console.error(`VERIFICATION EVIDENCE GATE: FAIL — ${file} is not passed.`);
    process.exitCode = 1;
  }
  if (value.expectedFingerprint !== value.actualFingerprint) {
    console.error(`VERIFICATION EVIDENCE GATE: FAIL — ${file} expected/actual fingerprints differ.`);
    process.exitCode = 1;
  }
  if (!REQUIRED_TOOLS.has(value.toolId)) {
    console.error(`VERIFICATION EVIDENCE GATE: FAIL — unregistered tool evidence: ${value.toolId}`);
    process.exitCode = 1;
  }
  passed.set(value.toolId, (passed.get(value.toolId) ?? 0) + 1);
}

for (const toolId of REQUIRED_TOOLS) {
  if (!passed.has(toolId)) {
    console.error(`VERIFICATION EVIDENCE GATE: FAIL — missing passing evidence for ${toolId}.`);
    process.exitCode = 1;
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`VERIFICATION EVIDENCE GATE: PASS — ${passed.size} tools have auditable passing evidence.`);
