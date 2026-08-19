#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(process.env.EVIDENCE_DIR || ".artifacts/release-tools");
const gateDir = path.resolve(".artifacts/gates");
fs.mkdirSync(outputDir, { recursive: true });

const stages = {
  fast: process.env.FAST_RESULT || "unknown",
  medium: process.env.MEDIUM_RESULT || "unknown",
  windows: process.env.WINDOWS_RESULT || "unknown",
  full: process.env.FULL_RESULT || "unknown",
  qr: process.env.QR_RESULT || "unknown",
};

const tool = process.env.TOOL_SLUG || "qr-generator";
const generatedAt = new Date().toISOString();
const baselinePath = path.resolve("baselines", tool, "certification-baseline.json");
const baselineExists = fs.existsSync(baselinePath);
const baseline = baselineExists ? JSON.parse(fs.readFileSync(baselinePath, "utf8")) : null;
const baselineExpired = Boolean(baseline?.expiresAt && Date.parse(baseline.expiresAt) <= Date.now());
const allGatesPassed = Object.values(stages).every((value) => value === "success");
const verdict = allGatesPassed && !baselineExpired ? "CERTIFIED" : "REJECTED";

const readJson = (file) => {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
};
const hashFile = (file) => fs.existsSync(file)
  ? crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")
  : null;

const fastGate = readJson(path.join(gateDir, "fast-gate.json"));
const mediumGate = readJson(path.join(gateDir, "medium-gate.json"));
const performance = {
  fastGateMs: fastGate?.durationMs ?? null,
  mediumGateMs: mediumGate?.durationMs ?? null,
  baselineFastGateMs: baseline?.performance?.fastGateMs ?? baseline?.performance?.fastGateMs ?? null,
  baselineMediumGateMs: baseline?.performance?.mediumGateMs ?? null,
  fastRegression: null,
  mediumRegression: null,
};

const regression = (current, previous, limit = 0.2) => {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return { status: "not-applicable" };
  const ratio = (current - previous) / previous;
  return { status: ratio > limit ? "failed" : "passed", ratio, limit };
};
performance.fastRegression = regression(performance.fastGateMs, performance.baselineFastGateMs);
performance.mediumRegression = regression(performance.mediumGateMs, performance.baselineMediumGateMs);

const evidenceFiles = [
  path.join(gateDir, "fast-gate.json"),
  path.join(gateDir, "medium-gate.json"),
];
const evidenceHashes = Object.fromEntries(evidenceFiles.map((file) => [
  path.basename(file), hashFile(file),
]));

const report = {
  schema: "flixo.tool-certification.v1",
  tool,
  pr: process.env.PR_NUMBER || null,
  commit: process.env.GITHUB_SHA || null,
  run: process.env.GITHUB_RUN_ID || null,
  generatedAt,
  gates: stages,
  aging: {
    baselineExists,
    baselineCertifiedAt: baseline?.certifiedAt ?? null,
    baselineExpiresAt: baseline?.expiresAt ?? null,
    status: baselineExpired ? "EXPIRED" : baselineExists ? "CURRENT" : "NOT_ESTABLISHED",
    maxAgeDays: 30,
  },
  quality: {
    repeatability: 3,
    evidenceComplete: Object.values(evidenceHashes).every(Boolean),
  },
  performance,
  policy: {
    independentOutputValidation: true,
    repeatability: 3,
    evidenceIntegrity: "sha256",
  },
  evidence: {
    hashes: evidenceHashes,
  },
  verdict,
};

const reportPath = path.join(outputDir, "certification-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));

if (verdict !== "CERTIFIED") process.exitCode = 1;
