import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), ".artifacts/pdf-merge");
const expectedCommit = process.env.GITHUB_SHA;
const expectedRunId = process.env.GITHUB_RUN_ID;
const requiredGates = ["fast", "medium", "correctness", "browser", "stability", "full"];

const findManifests = (directory) => {
  if (!fs.existsSync(directory)) return [];
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...findManifests(fullPath));
    else if (entry.name === "gate-manifest.json") found.push(fullPath);
  }
  return found;
};

const manifests = findManifests(root).map((file) => ({ file, manifest: JSON.parse(fs.readFileSync(file, "utf8")) }));
const errors = [];

for (const gate of requiredGates) {
  const entry = manifests.find((item) => item.manifest.gate === gate);
  if (!entry) { errors.push(`${gate}: evidence manifest missing`); continue; }
  const { manifest, file } = entry;
  if (manifest.commit !== expectedCommit) errors.push(`${gate}: commit mismatch`);
  if (String(manifest.runId) !== String(expectedRunId)) errors.push(`${gate}: runId mismatch`);
  if (manifest.gate !== gate) errors.push(`${gate}: gate identity mismatch`);
  if (manifest.status !== "success") errors.push(`${gate}: status=${manifest.status}`);
  if (!manifest.evidenceSha256) errors.push(`${gate}: evidence hash missing`);

  const evidencePath = path.join(path.dirname(file), manifest.evidenceFile || "gate-evidence.json");
  if (!fs.existsSync(evidencePath)) { errors.push(`${gate}: evidence file missing`); continue; }
  const digest = crypto.createHash("sha256").update(fs.readFileSync(evidencePath)).digest("hex");
  if (digest !== manifest.evidenceSha256) errors.push(`${gate}: evidence SHA-256 mismatch`);
}

const result = {
  schemaVersion: 1,
  tool: "pdf-merge",
  expectedCommit,
  expectedRunId,
  requiredGates,
  verifiedGates: manifests.map(({ manifest }) => manifest.gate).sort(),
  status: errors.length ? "REJECTED" : "CERTIFIED",
  errors,
  verifiedAt: new Date().toISOString(),
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
