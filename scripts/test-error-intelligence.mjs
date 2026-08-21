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
await fs.writeFile(memoryPath, JSON.stringify({ schemaVersion: 2, maxEntries: 500, entries: {}, metrics: { diagnosesReviewed: 0, diagnosesAccurate: 0, diagnosesFalsePositive: 0 } }, null, 2));

const env = { ...process.env, ERROR_REPORT_PATH: path.relative(root, reportPath), ERROR_MEMORY_PATH: path.relative(root, memoryPath) };
const run = () => spawnSync(process.execPath, ["scripts/error-intelligence-engine.mjs"], { cwd: root, encoding: "utf8", env });

const firstRun = run();
if (firstRun.status !== 0) throw new Error(firstRun.stderr || firstRun.stdout || "Error Intelligence engine exited non-zero.");
const first = JSON.parse(await fs.readFile(reportPath, "utf8"));
if (first.rootCauseCode !== "deleted-legacy-file-reference") throw new Error("Root-cause rule did not classify the deleted legacy file reference.");
if (first.diagnosisConfidence < 0.9) throw new Error("Diagnosis confidence below the deterministic contract threshold.");
if (!first.fingerprint || first.fingerprint.length !== 32) throw new Error("Fingerprint was not generated correctly.");
if (first.autoApply !== false || first.requiresHumanReview !== true) throw new Error("Safety contract was not preserved.");
if (first.memory.hit !== false || first.memory.occurrences !== 1) throw new Error("First memory lookup should be a miss with one occurrence.");

const secondRun = run();
if (secondRun.status !== 0) throw new Error(secondRun.stderr || secondRun.stdout || "Second Error Intelligence run failed.");
const second = JSON.parse(await fs.readFile(reportPath, "utf8"));
if (second.memory.hit !== true || second.memory.occurrences !== 2) throw new Error("Repeated failure did not produce a DecisionMemoryHit.");
if (second.memoryMetrics.maxEntries !== 500) throw new Error("Failure memory max-entry contract is missing.");

for (const [script, envKey] of [
  ["scripts/error-intelligence-dashboard.mjs", "ERROR_DASHBOARD_OUT"],
  ["scripts/error-intelligence-v3-bridge.mjs", "V3_DIAGNOSIS_OUT"],
  ["scripts/error-intelligence-self-heal-bridge.mjs", "SELF_HEAL_SUGGESTION_OUT"],
]) {
  const target = path.join(dir, path.basename(script).replace(/\.mjs$/, ".json").replace("error-intelligence-dashboard.json", "dashboard.md"));
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8", env: { ...env, [envKey]: path.relative(root, target) } });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${script} failed.`);
  await fs.access(target);
  if (script.includes("self-heal")) {
    const bridge = JSON.parse(await fs.readFile(target, "utf8"));
    if (bridge.autoApply !== false || bridge.requiresHumanReview !== true) throw new Error("Self-heal advisory safety contract failed.");
  }
  if (script.includes("v3-bridge")) {
    const bridge = JSON.parse(await fs.readFile(target, "utf8"));
    if (bridge.planOnly !== true || bridge.autoApply !== false) throw new Error("V3 bridge safety contract failed.");
  }
}

const load = spawnSync(process.execPath, ["scripts/test-failure-memory-load.mjs"], { cwd: root, encoding: "utf8", env: { ...process.env, FAILURE_MEMORY_LOAD_COUNT: "1200" } });
if (load.status !== 0) throw new Error(load.stderr || load.stdout || "Failure memory load test failed.");

console.log("ERROR INTELLIGENCE SELF-TEST: PASS");
console.log("- deterministic root-cause classification: PASS");
console.log("- diagnosis confidence >= 90%: PASS");
console.log("- fingerprint generation: PASS");
console.log("- first-seen memory miss: PASS");
console.log("- repeated failure memory hit: PASS");
console.log("- V3 plan-only bridge: PASS");
console.log("- Self-Heal advisory-only bridge: PASS");
console.log("- Failure Memory load benchmark: PASS");
console.log("- autoApply=false safety contract: PASS");
