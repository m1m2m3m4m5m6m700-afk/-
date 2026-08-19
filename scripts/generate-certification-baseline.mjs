#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const slug = process.env.TOOL_SLUG || "qr-generator";
const reportDir = path.resolve(process.env.EVIDENCE_DIR || ".artifacts/release-tools");
const reportPath = path.join(reportDir, "certification-report.json");
const baselineDir = path.join(reportDir, "baselines", slug);

if (!fs.existsSync(reportPath)) {
  console.error(`Certification report missing: ${reportPath}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
if (report.verdict !== "CERTIFIED") {
  console.log(`Baseline not generated because verdict is ${report.verdict}.`);
  process.exit(0);
}

fs.mkdirSync(baselineDir, { recursive: true });
const existingPath = path.join(baselineDir, "certification-baseline.json");
const previous = fs.existsSync(existingPath) ? JSON.parse(fs.readFileSync(existingPath, "utf8")) : null;
const certifiedAt = report.generatedAt || new Date().toISOString();
const baselineId = `${slug}-baseline-v${Number(previous?.version || 0) + 1}`;

const baseline = {
  schemaVersion: 1,
  baselineId,
  version: Number(previous?.version || 0) + 1,
  tool: slug,
  status: "certified",
  verdict: "CERTIFIED",
  createdAt: previous?.createdAt || certifiedAt,
  lastRecertifiedAt: certifiedAt,
  certifiedCommit: report.commit,
  certifiedRun: report.run,
  certifiedAt,
  expiresAt: new Date(Date.parse(certifiedAt) + 30 * 24 * 60 * 60 * 1000).toISOString(),
  gates: report.gates,
  quality: report.quality || {},
  performance: {
    ...(report.performance || {}),
    mediumGateMs: report.performance?.mediumGateMs ?? null,
  },
  evidence: {
    hashes: report.evidence?.hashes ?? {},
    baselineId,
  },
};

const outputPath = path.join(baselineDir, "certification-baseline.json");
fs.writeFileSync(outputPath, JSON.stringify(baseline, null, 2) + "\n");
console.log(`Baseline generated: ${outputPath}`);
