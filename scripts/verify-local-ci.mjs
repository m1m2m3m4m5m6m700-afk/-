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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

const root = process.cwd();
const reportDir = join(root, ".artifacts", "local-ci");
mkdirSync(reportDir, { recursive: true });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function writeReport(report) {
  const reportPath = join(reportDir, "local-ci-report.json");
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function run(name, command, args) {
  const started = performance.now();
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });
  const durationMs = Math.round(performance.now() - started);
  return {
    name,
    command: [command, ...args].join(" "),
    passed: result.status === 0,
    durationMs,
    exitCode: result.status ?? 1,
  };
}

function readNvmrc() {
  const nvmrcPath = join(root, ".nvmrc");
  if (!existsSync(nvmrcPath)) {
    throw new Error("Missing .nvmrc; cannot prove CI Node version parity.");
  }
  const value = readFileSync(nvmrcPath, "utf8").trim();
  if (!value) throw new Error(".nvmrc is empty; cannot prove CI Node version parity.");
  return value;
}

function expectedNodeMajor(nvmrc) {
  const match = nvmrc.match(/^(?:v)?(\d+)(?:\.|$)/);
  if (!match) throw new Error(`Unsupported .nvmrc value: ${nvmrc}`);
  return Number.parseInt(match[1], 10);
}

const nodeVersion = process.version;
const nvmrc = readNvmrc();
const nodeMajor = Number.parseInt(nodeVersion.slice(1).split(".")[0], 10);
const expectedMajor = expectedNodeMajor(nvmrc);
const skipE2E = process.env.SKIP_E2E === "1";
const nodeVersionMatches = nodeMajor === expectedMajor;

if (!nodeVersionMatches) {
  const report = {
    generatedAt: new Date().toISOString(),
    nodeVersion,
    nvmrc,
    nodeMajor,
    expectedMajor,
    nodeVersionMatches,
    skipE2E,
    results: [],
    passed: false,
    totalDurationMs: 0,
    failure: `Node major mismatch: running ${nodeVersion}, expected Node ${expectedMajor} from .nvmrc.`,
  };
  const reportPath = writeReport(report);
  console.error(report.failure);
  console.error(`Local CI report: ${reportPath}`);
  process.exit(1);
}

const results = [];

results.push(run("npm ci", npm, ["ci"]));
if (!results.at(-1).passed) {
  const report = {
    generatedAt: new Date().toISOString(),
    nodeVersion,
    nvmrc,
    nodeMajor,
    expectedMajor,
    nodeVersionMatches,
    skipE2E,
    results,
    passed: false,
    totalDurationMs: results[0].durationMs,
    failure: "npm ci failed.",
  };
  const reportPath = writeReport(report);
  console.error(`LOCAL CI: STOP — npm ci failed. Report: ${reportPath}`);
  process.exit(1);
}

results.push(run("typecheck", npm, ["run", "typecheck"]));
if (!results.at(-1).passed) {
  const reportPath = writeReport({
    generatedAt: new Date().toISOString(), nodeVersion, nvmrc, nodeMajor,
    expectedMajor, nodeVersionMatches, skipE2E, results, passed: false,
    totalDurationMs: results.reduce((sum, result) => sum + result.durationMs, 0),
    failure: "typecheck failed.",
  });
  console.error(`LOCAL CI: STOP — typecheck failed. Report: ${reportPath}`);
  process.exit(1);
}

results.push(run("lint", npm, ["run", "lint"]));
if (!results.at(-1).passed) {
  const reportPath = writeReport({
    generatedAt: new Date().toISOString(), nodeVersion, nvmrc, nodeMajor,
    expectedMajor, nodeVersionMatches, skipE2E, results, passed: false,
    totalDurationMs: results.reduce((sum, result) => sum + result.durationMs, 0),
    failure: "lint failed.",
  });
  console.error(`LOCAL CI: STOP — lint failed. Report: ${reportPath}`);
  process.exit(1);
}

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
  results.push(run(name, npm, args));
  if (!results.at(-1).passed) {
    const reportPath = writeReport({
      generatedAt: new Date().toISOString(), nodeVersion, nvmrc, nodeMajor,
      expectedMajor, nodeVersionMatches, skipE2E, results, passed: false,
      totalDurationMs: results.reduce((sum, result) => sum + result.durationMs, 0),
      failure: `${name} failed.`,
    });
    console.error(`LOCAL CI: STOP — ${name} failed. Report: ${reportPath}`);
    process.exit(1);
  }
}

if (!skipE2E) {
  results.push(run("E2E", npm, ["run", "test:e2e"]));
  if (!results.at(-1).passed) {
    const reportPath = writeReport({
      generatedAt: new Date().toISOString(), nodeVersion, nvmrc, nodeMajor,
      expectedMajor, nodeVersionMatches, skipE2E, results, passed: false,
      totalDurationMs: results.reduce((sum, result) => sum + result.durationMs, 0),
      failure: "E2E failed.",
    });
    console.error(`LOCAL CI: STOP — E2E failed. Report: ${reportPath}`);
    process.exit(1);
  }
}

results.push(run("build", npm, ["run", "build"]));
if (!results.at(-1).passed) {
  const reportPath = writeReport({
    generatedAt: new Date().toISOString(), nodeVersion, nvmrc, nodeMajor,
    expectedMajor, nodeVersionMatches, skipE2E, results, passed: false,
    totalDurationMs: results.reduce((sum, result) => sum + result.durationMs, 0),
    failure: "build failed.",
  });
  console.error(`LOCAL CI: STOP — build failed. Report: ${reportPath}`);
  process.exit(1);
}

results.push(run("build-output", process.execPath, ["src/scripts/validate-build-output.mjs"]));
const report = {
  generatedAt: new Date().toISOString(),
  nodeVersion,
  nvmrc,
  nodeMajor,
  expectedMajor,
  nodeVersionMatches,
  skipE2E,
  results,
  passed: results.every((r) => r.passed),
  totalDurationMs: results.reduce((sum, r) => sum + r.durationMs, 0),
};
const reportPath = writeReport(report);
console.log(`\nLocal CI report: ${reportPath}`);
console.log(`Local CI result: ${report.passed ? "PASS" : "FAIL"}`);
console.log(`Total measured time: ${(report.totalDurationMs / 1000).toFixed(2)}s`);

if (!report.passed) process.exit(1);
