#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(process.env.EVIDENCE_DIR || ".artifacts/release-tools");
fs.mkdirSync(outputDir, { recursive: true });

const stages = {
  fast: process.env.FAST_RESULT || "unknown",
  medium: process.env.MEDIUM_RESULT || "unknown",
  windows: process.env.WINDOWS_RESULT || "unknown",
  full: process.env.FULL_RESULT || "unknown",
  qr: process.env.QR_RESULT || "unknown",
};

const verdict = Object.values(stages).every((value) => value === "success") ? "CERTIFIED" : "REJECTED";
const slug = process.env.TOOL_SLUG || "qr-generator";
const baselinePath = path.resolve("baselines", slug, "certification-baseline.json");
let baseline = null;
if (fs.existsSync(baselinePath)) baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

const report = {
  schema: "flixo.tool-certification.v1",
  tool: slug,
  pr: process.env.PR_NUMBER || null,
  commit: process.env.GITHUB_SHA || null,
  run: process.env.GITHUB_RUN_ID || null,
  generatedAt: new Date().toISOString(),
  gates: stages,
  quality: {
    testCount: Number(process.env.TEST_COUNT || 0),
    vulnerabilities: Number(process.env.VULNERABILITIES || 0),
  },
  performance: {
    mediumGateMs: Number(process.env.MEDIUM_GATE_MS || 0),
  },
  baseline: {
    baselineId: baseline?.baselineId || null,
    status: baseline
      ? (baseline.expiresAt && Date.parse(baseline.expiresAt) <= Date.now() ? "EXPIRED" : "CURRENT")
      : "NOT_ESTABLISHED",
  },
  policy: {
    independentOutputValidation: true,
    repeatability: 3,
    evidenceIntegrity: "sha256",
  },
  verdict,
};

const reportPath = path.join(outputDir, "certification-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));

if (verdict !== "CERTIFIED") process.exitCode = 1;
