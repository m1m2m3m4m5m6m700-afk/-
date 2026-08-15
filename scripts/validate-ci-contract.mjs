#!/usr/bin/env node
/**
 * CI contract validator.
 *
 * This runs before dependency installation and verifies that workflow commands
 * remain backed by real project scripts/files. It is intentionally dependency-free
 * so it can run on a clean GitHub Actions runner.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packagePath = path.join(root, "package.json");
const workflowsDir = path.join(root, ".github", "workflows");
const nvmrcPath = path.join(root, ".nvmrc");

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

const pkg = readJson(packagePath);
const scripts = pkg?.scripts ?? {};

if (pkg && !scripts["validate-ci-contract"]) {
  failures.push("package.json: missing scripts.validate-ci-contract");
}

if (fs.existsSync(nvmrcPath) && pkg?.engines?.node) {
  const nvmVersion = readText(nvmrcPath).trim();
  const engine = String(pkg.engines.node).trim();
  const normalizedNvm = nvmVersion.replace(/^v/, "");

  if (engine !== normalizedNvm && engine !== `${normalizedNvm}.x`) {
    failures.push(
      `Node version mismatch: .nvmrc=${normalizedNvm}, package.json engines.node=${engine}`,
    );
  }
}

if (!fs.existsSync(workflowsDir)) {
  failures.push(".github/workflows: directory is missing");
} else {
  const workflowFiles = fs
    .readdirSync(workflowsDir)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .map((name) => path.join(workflowsDir, name));

  if (!workflowFiles.length) {
    failures.push(".github/workflows: no workflow files found");
  }

  for (const workflowFile of workflowFiles) {
    const workflow = readText(workflowFile);
    const relativeWorkflow = path.relative(root, workflowFile);

    for (const match of workflow.matchAll(/\bnpm\s+run\s+([A-Za-z0-9:_-]+)/g)) {
      const scriptName = match[1];
      if (!scripts[scriptName]) {
        failures.push(`${relativeWorkflow}: npm run ${scriptName} is not defined in package.json`);
      }
    }

    for (const match of workflow.matchAll(/(?:^|\s)node\s+((?:src|scripts)\/[^\s`]+\.mjs)/g)) {
      const scriptPath = path.join(root, match[1]);
      if (!fs.existsSync(scriptPath)) {
        failures.push(`${relativeWorkflow}: node target ${match[1]} does not exist`);
      }
    }

    for (const match of workflow.matchAll(/node-version-file:\s*([^\s#]+)/g)) {
      const versionFile = match[1].trim();
      if (!fs.existsSync(path.join(root, versionFile))) {
        failures.push(`${relativeWorkflow}: node-version-file ${versionFile} does not exist`);
      }
    }
  }
}

if (failures.length) {
  console.error("CI contract validation FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("CI contract validation passed.");
