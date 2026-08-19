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

const report = {
  schema: "flixo.tool-certification.v1",
  tool: process.env.TOOL_SLUG || "qr-generator",
  pr: process.env.PR_NUMBER || null,
  commit: process.env.GITHUB_SHA || null,
  run: process.env.GITHUB_RUN_ID || null,
  generatedAt: new Date().toISOString(),
  gates: stages,
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
