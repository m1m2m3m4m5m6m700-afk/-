import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { appendDecision } from "./ai-decision-log.mjs";

const root = process.cwd();
const outputPath = process.env.FLIXO_VERIFY_TIMING_FILE || path.join(root, "diagnostics", "verify-timing.json");
const stages = [["verify:project", ["run", "verify:project"]], ["test:after-verify", ["run", "test:after-verify"]]];

function runStage(name, args) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", args, { cwd: root, stdio: "inherit", env: process.env });
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
  version: 2,
  sha: process.env.GITHUB_SHA || null,
  ref: process.env.GITHUB_REF_NAME || null,
  runId: process.env.GITHUB_RUN_ID || null,
  startedAt: new Date(startedAt).toISOString(),
  durationMs: Date.now() - startedAt,
  stages: results,
  passed: results.length === stages.length && results.every((stage) => stage.exitCode === 0),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

const evidence = {
  kind: "flixo-ai-evidence",
  version: 1,
  source: "verify-timing",
  sha: report.sha,
  ref: report.ref,
  runId: report.runId,
  verification: { passed: report.passed, durationMs: report.durationMs, stages: report.stages },
  policy: { repairAuthority: "experimental-only", autoApplyDefault: false, mainWritable: false },
};

console.log(JSON.stringify(report, null, 2));
console.log(`FLIXO_AI_EVIDENCE ${JSON.stringify(evidence)}`);
appendDecision({ event: "verification-run", passed: report.passed, durationMs: report.durationMs, stages: report.stages, source: "verify-timing" });
if (!report.passed) process.exit(1);
