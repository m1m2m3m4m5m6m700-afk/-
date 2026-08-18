#!/usr/bin/env node
/**
 * Local CI verification harness.
 *
 * Mirrors the repository's CI-critical checks without requiring GitHub/Vercel
 * credentials. It records wall-clock duration for each stage and writes a
 * machine-readable evidence file for before/after comparisons.
 *
 * Usage:
 *   node scripts/verify-local-ci.mjs
 *
 * Optional environment:
 *   SKIP_E2E=1   skip Playwright locally (useful for a quick code-only pass)
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

const root = process.cwd();
const reportDir = join(root, ".artifacts", "local-ci");
mkdirSync(reportDir, { recursive: true });

function run(name, command, args) {
  const started = performance.now();
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });
  const durationMs = Math.round(performance.now() - started);
  const passed = result.status === 0;
  return {
    name,
    command: [command, ...args].join(" "),
    passed,
    durationMs,
    exitCode: result.status ?? 1,
  };
}

const nodeVersion = process.version;
const nvmrc = existsSync(join(root, ".nvmrc"))
  ? (await import("node:fs/promises")).readFile(join(root, ".nvmrc"), "utf8").then((v) => v.trim())
  : null;

const results = [];
results.push(run("npm ci", process.platform === "win32" ? "npm.cmd" : "npm", ["ci"]));
if (!results.at(-1).passed) {
  console.error("LOCAL CI: STOP — npm ci failed.");
  process.exit(1);
}

results.push(run("typecheck", process.platform === "win32" ? "npm.cmd" : "npm", ["run", "typecheck"]));
results.push(run("lint", process.platform === "win32" ? "npm.cmd" : "npm", ["run", "lint"]));

const coreValidators = [
  ["registry", ["run", "validate:registry"]],
  ["tool-runtime", ["run", "validate:tool-runtime"]],
  ["search-catalog", ["run", "validate:search-catalog"]],
  ["SEO", ["run", "validate:seo"]],
  ["route-tree", ["run", "validate:route-tree"]],
  ["tool-content", ["run", "validate:tool-content"]],
  ["localization", ["run", "validate:localization"]],
  ["localization-surface", ["run", "validate:localization-surface"]],
  ["tool-review", ["run", "validate:tool-review"]],
  ["AI-contract", ["run", "validate:ai"]],
  ["search-intent", ["run", "validate:search-intent"]],
  ["accessibility-contract", ["run", "validate:accessibility"]],
  ["security-contract", ["run", "validate:security"]],
];

for (const [name, args] of coreValidators) {
  results.push(run(name, process.platform === "win32" ? "npm.cmd" : "npm", args));
  if (!results.at(-1).passed) {
    console.error(`LOCAL CI: STOP — ${name} failed.`);
    break;
  }
}

if (process.env.SKIP_E2E !== "1" && results.every((r) => r.passed)) {
  results.push(run("E2E", process.platform === "win32" ? "npm.cmd" : "npm", ["run", "test:e2e"]));
}

if (results.every((r) => r.passed)) {
  results.push(run("build", process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"]));
}

if (results.every((r) => r.passed)) {
  results.push(run("build-output", process.execPath, ["src/scripts/validate-build-output.mjs"]));
}

const report = {
  generatedAt: new Date().toISOString(),
  nodeVersion,
  nvmrc,
  nodeMajor: Number.parseInt(nodeVersion.slice(1).split(".")[0], 10),
  skipE2E: process.env.SKIP_E2E === "1",
  results,
  passed: results.every((r) => r.passed),
  totalDurationMs: results.reduce((sum, r) => sum + r.durationMs, 0),
};

const reportPath = join(reportDir, "local-ci-report.json");
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`\nLocal CI report: ${reportPath}`);
console.log(`Local CI result: ${report.passed ? "PASS" : "FAIL"}`);
console.log(`Total measured time: ${(report.totalDurationMs / 1000).toFixed(2)}s`);

if (!report.passed) process.exit(1);
