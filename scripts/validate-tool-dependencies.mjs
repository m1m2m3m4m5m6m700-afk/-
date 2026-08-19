#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const matrixPath = path.join(root, "tool-dependencies.json");
const slug = process.env.TOOL_SLUG || "qr-generator";
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const dependencies = matrix.dependencies?.[slug];
if (!Array.isArray(dependencies)) {
  console.error(`[DEPENDENCY GATE] FAIL: ${slug} is missing from tool-dependencies.json`);
  process.exit(1);
}
for (const dependency of dependencies) {
  const baselinePath = path.join(root, "baselines", dependency, "certification-baseline.json");
  if (!fs.existsSync(baselinePath)) {
    console.error(`[DEPENDENCY GATE] FAIL: ${dependency} baseline is missing`);
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  if (baseline.verdict !== "CERTIFIED" || baseline.status !== "certified") {
    console.error(`[DEPENDENCY GATE] FAIL: ${dependency} is not CERTIFIED`);
    process.exit(1);
  }
  if (baseline.expiresAt && Date.parse(baseline.expiresAt) <= Date.now()) {
    console.error(`[DEPENDENCY GATE] FAIL: ${dependency} baseline is EXPIRED`);
    process.exit(1);
  }
}
console.log(JSON.stringify({ tool: slug, dependencies, verdict: "DEPENDENCY_PASS" }, null, 2));
