#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const slug = process.env.TOOL_SLUG || "qr-generator";
const baselinePath = path.resolve("baselines", slug, "certification-baseline.json");
const gatePath = path.resolve(".artifacts/gates/medium-gate.json");
const outputPath = path.resolve(".artifacts/gates/performance-regression.json");
const warning = 0.10;
const failure = 0.20;
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

if (!fs.existsSync(baselinePath)) {
  const result = { tool: slug, status: "NOT_APPLICABLE", reason: "baseline not established yet" };
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}
if (!fs.existsSync(gatePath)) {
  const result = { tool: slug, status: "NOT_APPLICABLE", reason: "medium gate evidence unavailable" };
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const gate = JSON.parse(fs.readFileSync(gatePath, "utf8"));
const current = Number(gate.durationMs);
const previous = Number(baseline.performance?.mediumGateMs);
if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) {
  const result = { tool: slug, status: "NOT_APPLICABLE", reason: "baseline or current duration is not numeric", baselineId: baseline.baselineId || null };
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const ratio = (current - previous) / previous;
const result = {
  tool: slug,
  baselineId: baseline.baselineId || null,
  currentMs: current,
  baselineMs: previous,
  regressionPercent: Number((ratio * 100).toFixed(2)),
  warningThresholdPercent: 10,
  failureThresholdPercent: 20,
  status: ratio >= failure ? "failed" : ratio >= warning ? "warning" : "passed",
};
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
if (result.status === "failed") {
  console.error("Performance regression exceeded 20%.");
  process.exit(1);
}
