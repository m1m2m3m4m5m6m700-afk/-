#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const slug = process.env.TOOL_SLUG || "qr-generator";
const baselinePath = path.resolve("baselines", slug, "certification-baseline.json");
const gatePath = path.resolve(".artifacts/gates/medium-gate.json");

if (!fs.existsSync(baselinePath)) {
  console.log(`No baseline for ${slug}; performance regression check is not applicable until first certification.`);
  process.exit(0);
}
if (!fs.existsSync(gatePath)) {
  console.error(`Medium gate evidence missing: ${gatePath}`);
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const gate = JSON.parse(fs.readFileSync(gatePath, "utf8"));
const current = Number(gate.durationMs);
const previous = Number(baseline.performance?.mediumGateMs);

if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) {
  console.log("Performance regression check skipped: baseline or current duration is not numeric.");
  process.exit(0);
}

const limit = 0.2;
const ratio = (current - previous) / previous;
const result = {
  tool: slug,
  currentMs: current,
  baselineMs: previous,
  regressionRatio: ratio,
  limit,
  status: ratio > limit ? "failed" : "passed",
};

fs.mkdirSync(path.resolve(".artifacts/gates"), { recursive: true });
fs.writeFileSync(path.resolve(".artifacts/gates/performance-regression.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));

if (result.status === "failed") {
  console.error(`Performance regression exceeded ${limit * 100}%`);
  process.exit(1);
}
