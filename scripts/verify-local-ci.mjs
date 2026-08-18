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

const nodeVersion = process.version;
const nvmrc = existsSync(join(root, ".nvmrc"))
  ? readFileSync(join(root, ".nvmrc"), "utf8").trim()
  : null;
const nodeMajor = Number.parseInt(nodeVersion.slice(1).split(".")[0], 10);
const expectedMajor = nvmrc ? Number.parseInt(nvmrc.replace(/^v/, "").split(".")[0], 10) : 22;

if (!Number.isInteger(nodeMajor) || nodeMajor !== 22 || (Number.isInteger(expectedMajor) && expectedMajor !== nodeMajor)) {
  console.error(`LOCAL CI: STOP — Node mismatch. Running ${nodeVersion}, .nvmrc expects ${nvmrc ?? "22"}.`);
  process.exit(1);
}

const results = [];
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

results.push(run("npm ci", npm, ["ci"]));
if (!results.at(-1).passed) {
  console.error("LOCAL CI: STOP — npm ci failed.");
  process.exit(1);
}

results.push(run("typecheck", npm, ["run", "typecheck"]));
if (!results.at(-1).passed) process.exit(1);

results.push(run("lint", npm, ["run", "lint"]));
if (!results.at(-1).passed) process.exit(1);

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
    console.error(`LOCAL CI: STOP — ${name} failed.`);
    break;
  }
}

if (process.env.SKIP_E2E !== "1" && results.every((r) => r.passed)) {
  results.push(run("E2E", npm, ["run", "test:e2e"]));
}

if (results.every((r) => r.passed)) {
  results.push(run("build", npm, ["run", "build"]));
}

if (results.every((r) => r.passed)) {
  results.push(run("build-output", process.execPath, ["src/scripts/validate-build-output.mjs"]));
}

const report = {
  generatedAt: new Date().toISOString(),
  nodeVersion,
  nvmrc,
  nodeMajor,
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
