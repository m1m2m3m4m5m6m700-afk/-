#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(process.env.EVIDENCE_ROOT || ".artifacts/evidence");
const currentCommit = process.env.CURRENT_COMMIT || process.env.GITHUB_SHA || "";
const currentRunId = process.env.CURRENT_RUN_ID || process.env.GITHUB_RUN_ID || "";
const requiredGates = (process.env.REQUIRED_GATES || "fast,medium,windows,qr-node,qr-browser,qr-stability,full")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const failures = [];
const found = new Map();

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else results.push(full);
  }
  return results;
}

for (const manifestPath of walk(root).filter((file) => path.basename(file) === "gate-manifest.json")) {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    failures.push(`${manifestPath}: invalid JSON (${error.message})`);
    continue;
  }

  const gate = manifest.gate;
  if (!gate) {
    failures.push(`${manifestPath}: missing gate`);
    continue;
  }
  if (found.has(gate)) {
    failures.push(`${gate}: duplicate evidence manifest`);
    continue;
  }
  found.set(gate, manifest);

  if (manifest.schema !== "flixo.gate-evidence.v1") failures.push(`${gate}: invalid schema`);
  if (manifest.status !== "PASS") failures.push(`${gate}: status is ${manifest.status}`);
  if (manifest.commit !== currentCommit) failures.push(`${gate}: commit mismatch`);
  if (String(manifest.runId) !== String(currentRunId)) failures.push(`${gate}: runId mismatch`);
  if (!manifest.createdAt || !manifest.expiresAt) failures.push(`${gate}: missing timestamps`);
  if (manifest.expiresAt && Date.parse(manifest.expiresAt) <= Date.now()) failures.push(`${gate}: evidence expired`);

  const evidenceFile = manifest.evidence?.file;
  const expectedSha = manifest.evidence?.sha256;
  const expectedBytes = Number(manifest.evidence?.bytes);
  if (!evidenceFile || !expectedSha) {
    failures.push(`${gate}: incomplete evidence metadata`);
    continue;
  }

  const candidatePaths = [
    path.join(path.dirname(manifestPath), path.basename(evidenceFile)),
    path.resolve(root, evidenceFile),
  ];
  const actualPath = candidatePaths.find((candidate) => fs.existsSync(candidate));
  if (!actualPath) {
    failures.push(`${gate}: evidence file not found (${evidenceFile})`);
    continue;
  }

  const buffer = fs.readFileSync(actualPath);
  const actualSha = crypto.createHash("sha256").update(buffer).digest("hex");
  if (actualSha !== expectedSha) failures.push(`${gate}: evidence sha256 mismatch`);
  if (Number.isFinite(expectedBytes) && buffer.length !== expectedBytes) failures.push(`${gate}: evidence byte count mismatch`);
}

for (const gate of requiredGates) {
  if (!found.has(gate)) failures.push(`${gate}: required evidence missing`);
}

const result = {
  schema: "flixo.certification-evidence-validation.v1",
  commit: currentCommit || null,
  runId: currentRunId || null,
  requiredGates,
  foundGates: [...found.keys()].sort(),
  integrity: failures.length === 0 ? "PASS" : "FAIL",
  status: failures.length === 0 ? "CERTIFIED" : "REJECTED",
  failures,
};

console.log(JSON.stringify(result, null, 2));
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(path.join(root, "evidence-validation.json"), JSON.stringify(result, null, 2) + "\n");
if (failures.length) process.exit(1);
