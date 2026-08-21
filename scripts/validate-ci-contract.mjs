#!/usr/bin/env node
/** Minimal CI contract validator. */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`${path.relative(root, file)}: invalid JSON (${error.message})`);
    return null;
  }
}

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    failures.push(`${path.relative(root, file)}: cannot read file (${error.message})`);
    return "";
  }
}

const pkg = readJson(path.join(root, "package.json"));
const nvmVersion = readText(path.join(root, ".nvmrc")).trim().replace(/^v/, "");
const workflow = readText(path.join(root, ".github", "workflows", "ci.yml"));
const vercel = readJson(path.join(root, "vercel.json"));

if (!pkg?.scripts?.["validate-ci-contract"]) {
  failures.push("package.json: missing scripts.validate-ci-contract");
}

if (nvmVersion && pkg?.engines?.node) {
  const engine = String(pkg.engines.node).trim();
  if (engine !== nvmVersion && engine !== `${nvmVersion}.x`) {
    failures.push(`Node version mismatch: .nvmrc=${nvmVersion}, package.json engines.node=${engine}`);
  }
}

if (!workflow) {
  failures.push(".github/workflows/ci.yml: canonical workflow is missing");
} else {
  if (!/^name:\s*CI\s*$/m.test(workflow)) failures.push("ci.yml: workflow name must be CI");
  if (!/pull_request:/m.test(workflow)) failures.push("ci.yml: pull_request trigger is required");
  if (!/node-version-file:\s*\.nvmrc/m.test(workflow)) failures.push("ci.yml: Node must come from .nvmrc");
  if (!/max-parallel:\s*24/m.test(workflow)) failures.push("ci.yml: parallel check matrix must allow up to 24 concurrent checks");
  if (!/gate:/m.test(workflow)) failures.push("ci.yml: final gate job is required");
  if (!/PARALLEL CI GATE: PASS/m.test(workflow)) failures.push("ci.yml: final parallel gate marker is required");
  if (!/diagnostics:/m.test(workflow) || !/node scripts\/diagnose-ci-failure\.mjs/m.test(workflow)) failures.push("ci.yml: failure diagnostics engine is required");
  if (!/node scripts\/scan-secrets\.mjs/m.test(workflow)) failures.push("ci.yml: secrets scan is required");
  if (!/github\/codeql-action\/(init|analyze)@v4/m.test(workflow)) failures.push("ci.yml: CodeQL v4 is required");
}

if (vercel) {
  const installCommand = String(vercel.installCommand ?? "");
  if (!installCommand.includes("validate-package-lock-contract.mjs")) {
    failures.push("vercel.json: installCommand must validate the package lock contract");
  }
  if (!/\bnpm\s+ci\b/.test(installCommand)) {
    failures.push("vercel.json: installCommand must use npm ci");
  }
}

if (failures.length) {
  console.error("CI contract validation FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("CI contract validation passed.");
