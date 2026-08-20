import fs from "node:fs";
import path from "node:path";
import { appendDecision } from "./ai-decision-log.mjs";

const root = process.cwd();
const outputPath = process.env.FLIXO_VERIFY_TIMING_FILE || path.join(root, "diagnostics", "verify-timing.json");
const [, , mode, startArg, endArg, exitArg] = process.argv;

if (mode !== "--record") {
  throw new Error("verify-timing is a recorder only; CI must execute `npm run verify` directly and then call `--record`.");
}

const startedMs = Number(startArg);
const endedMs = Number(endArg);
const exitCode = Number(exitArg);
if (!Number.isFinite(startedMs) || !Number.isFinite(endedMs) || !Number.isFinite(exitCode)) {
  throw new Error("Usage: node scripts/verify-timing.mjs --record <startMs> <endMs> <exitCode>");
}

const durationMs = Math.max(0, endedMs - startedMs);
const report = {
  version: 2,
  sha: process.env.GITHUB_SHA || null,
  ref: process.env.GITHUB_REF_NAME || null,
  runId: process.env.GITHUB_RUN_ID || null,
  startedAt: new Date(startedMs).toISOString(),
  endedAt: new Date(endedMs).toISOString(),
  durationMs,
  stages: [{ name: "npm run verify", exitCode, signal: null, durationMs }],
  passed: exitCode === 0,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

const evidence = {
  kind: "flixo-ai-evidence",
  version: 1,
  source: "canonical-verification",
  sha: report.sha,
  ref: report.ref,
  runId: report.runId,
  verification: { passed: report.passed, durationMs, stages: report.stages },
  policy: { repairAuthority: "experimental-only", autoApplyDefault: false, mainWritable: false },
};

console.log(JSON.stringify(report, null, 2));
console.log(`FLIXO_AI_EVIDENCE ${JSON.stringify(evidence)}`);
appendDecision({ event: "verification-run", passed: report.passed, durationMs, stages: report.stages, source: "canonical-verification" });
if (!report.passed) process.exit(1);
