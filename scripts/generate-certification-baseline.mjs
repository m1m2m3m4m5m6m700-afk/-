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
const baseline = {
  schemaVersion: 1,
  tool: slug,
  status: "certified",
  verdict: "CERTIFIED",
  certifiedCommit: report.commit,
  certifiedRun: report.run,
  certifiedAt: report.generatedAt,
  expiresAt: new Date(Date.parse(report.generatedAt) + 30 * 24 * 60 * 60 * 1000).toISOString(),
  gates: report.gates,
  quality: report.quality,
  performance: report.performance,
  evidence: {
    hashes: report.evidence?.hashes ?? {},
  },
};

const outputPath = path.join(baselineDir, "certification-baseline.json");
fs.writeFileSync(outputPath, JSON.stringify(baseline, null, 2) + "\n");
console.log(`Baseline generated: ${outputPath}`);
