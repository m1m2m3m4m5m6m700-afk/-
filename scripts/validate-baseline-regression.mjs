#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const slug = process.env.TOOL_SLUG || "qr-generator";
const evidencePath = path.join(root, ".artifacts", "gates", "medium-gate.json");
const baselinePath = path.join(root, "baselines", slug, "certification-baseline.json");
const warningPct = Number(process.env.REGRESSION_WARNING_PCT || 10);
const failurePct = Number(process.env.REGRESSION_FAILURE_PCT || 20);

if (!fs.existsSync(evidencePath)) {
  console.log(JSON.stringify({ tool: slug, status: "NOT_APPLICABLE", reason: "medium evidence unavailable" }, null, 2));
  process.exit(0);
}
if (!fs.existsSync(baselinePath)) {
  console.log(JSON.stringify({ tool: slug, status: "NOT_APPLICABLE", reason: "baseline not established yet" }, null, 2));
  process.exit(0);
}

const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const currentMs = Number(evidence.durationMs || 0);
const baselineMs = Number(baseline.performance?.mediumGateMs || baseline.performance?.mediumGateDurationMs || 0);

if (!baselineMs || !currentMs) {
  console.log(JSON.stringify({ tool: slug, status: "NOT_APPLICABLE", reason: "missing comparable duration" }, null, 2));
  process.exit(0);
}

const regressionPct = ((currentMs - baselineMs) / baselineMs) * 100;
const status = regressionPct >= failurePct ? "FAIL" : regressionPct >= warningPct ? "WARNING" : "PASS";
const result = {
  tool: slug,
  baselineId: baseline.baselineId || null,
  currentMs,
  baselineMs,
  regressionPct: Number(regressionPct.toFixed(2)),
  warningThresholdPct: warningPct,
  failureThresholdPct: failurePct,
  status,
};

console.log(JSON.stringify(result, null, 2));
if (status === "FAIL") process.exit(1);
