import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, ".artifacts", "error-intelligence-test");
const reportPath = path.join(dir, "error-report.json");
const memoryPath = path.join(dir, "failure-memory.json");
await fs.mkdir(dir, { recursive: true });

const input = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "test",
  commitSha: "test-sha",
  status: "failure",
  errorType: "unknown",
  severity: "medium",
  message: "Error: ENOENT: no such file or directory, open src/data/tools.ts",
  affectedFiles: [],
  autoApply: false,
  requiresHumanReview: true,
};

await fs.writeFile(reportPath, JSON.stringify(input, null, 2));
await fs.writeFile(memoryPath, JSON.stringify({ schemaVersion: 1, entries: {} }, null, 2));

const run = spawnSync(process.execPath, ["scripts/error-intelligence-engine.mjs"], {
  cwd: root,
  encoding: "utf8",
  env: {
    ...process.env,
    ERROR_REPORT_PATH: path.relative(root, reportPath),
    ERROR_MEMORY_PATH: path.relative(root, memoryPath),
  },
});

if (run.status !== 0) throw new Error(run.stderr || run.stdout || "Error Intelligence engine exited non-zero.");

const first = JSON.parse(await fs.readFile(reportPath, "utf8"));
if (first.rootCauseCode !== "deleted-legacy-file-reference") throw new Error("Root-cause rule did not classify the deleted legacy file reference.");
if (!first.fingerprint || first.fingerprint.length !== 32) throw new Error("Fingerprint was not generated correctly.");
if (first.autoApply !== false || first.requiresHumanReview !== true) throw new Error("Safety contract was not preserved.");
if (first.memory.hit !== false || first.memory.occurrences !== 1) throw new Error("First memory lookup should be a miss with one occurrence.");

const runAgain = spawnSync(process.execPath, ["scripts/error-intelligence-engine.mjs"], {
  cwd: root,
  encoding: "utf8",
  env: {
    ...process.env,
    ERROR_REPORT_PATH: path.relative(root, reportPath),
    ERROR_MEMORY_PATH: path.relative(root, memoryPath),
  },
});
if (runAgain.status !== 0) throw new Error(runAgain.stderr || runAgain.stdout || "Second Error Intelligence run failed.");

const second = JSON.parse(await fs.readFile(reportPath, "utf8"));
if (second.memory.hit !== true || second.memory.occurrences !== 2) throw new Error("Repeated failure did not produce a DecisionMemoryHit.");

console.log("ERROR INTELLIGENCE SELF-TEST: PASS");
console.log("- deterministic root-cause classification: PASS");
console.log("- fingerprint generation: PASS");
console.log("- first-seen memory miss: PASS");
console.log("- repeated failure memory hit: PASS");
console.log("- autoApply=false safety contract: PASS");
