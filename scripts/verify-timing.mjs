import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getExactHeadSha } from "./utils/get-head-sha.mjs";

const root = process.cwd();
const outputPath = process.env.FLIXO_VERIFY_TIMING_FILE || path.join(root, "diagnostics", "verify-timing.json");
const stages = [
  ["diagnose:self-test", ["scripts/diagnostics/test-scanners.mjs"]],
  ["diagnose:all", ["run", "diagnose:all"]],
  ["verify:project", ["run", "verify:project"]],
  ["test:after-verify", ["run", "test:after-verify"]],
  ["diagnose:rule-aging", ["scripts/diagnostics/telemetry-rule-aging.mjs"]],
];

function runStage(name, args) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const command = args[0] === "run" ? (process.platform === "win32" ? "npm.cmd" : "npm") : process.execPath;
    const commandArgs = args[0] === "run" ? args : args;
    const child = spawn(command, commandArgs, { cwd: root, stdio: "inherit", env: process.env });
    child.on("close", (code, signal) => resolve({ name, exitCode: typeof code === "number" ? code : 1, signal: signal || null, durationMs: Date.now() - startedAt }));
    child.on("error", () => resolve({ name, exitCode: 1, signal: null, durationMs: Date.now() - startedAt }));
  });
}

const startedAt = Date.now();
const results = [];
for (const [name, args] of stages) {
  const result = await runStage(name, args);
  results.push(result);
  if (result.exitCode !== 0) break;
}

const report = {
  version: 4,
  sha: getExactHeadSha(),
  ref: process.env.GITHUB_REF_NAME || null,
  runId: process.env.GITHUB_RUN_ID || null,
  startedAt: new Date(startedAt).toISOString(),
  durationMs: Date.now() - startedAt,
  stages: results,
  passed: results.length === stages.length && results.every((stage) => stage.exitCode === 0),
};

if (!/^[0-9a-f]{40}$/i.test(report.sha)) throw new Error("Verification report requires exact HEAD SHA");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));

if (!report.passed) process.exit(1);
