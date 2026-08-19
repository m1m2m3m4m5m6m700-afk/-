import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), ".artifacts/pdf-merge");
const expectedCommit = process.env.GITHUB_SHA;
const expectedRunId = process.env.GITHUB_RUN_ID;
const requiredGates = ["fast", "medium", "correctness", "browser", "stability", "full"];

const manifests = [];
if (fs.existsSync(root)) {
  for (const gate of fs.readdirSync(root)) {
    const file = path.join(root, gate, "gate-manifest.json");
    if (!fs.existsSync(file)) continue;
    manifests.push({ gate, file, manifest: JSON.parse(fs.readFileSync(file, "utf8")) });
  }
}

const errors = [];
for (const gate of requiredGates) {
  const entry = manifests.find((item) => item.gate === gate);
  if (!entry) {
    errors.push(`${gate}: evidence manifest missing`);
    continue;
  }
  const { manifest } = entry;
  if (manifest.commit !== expectedCommit) errors.push(`${gate}: commit mismatch`);
  if (String(manifest.runId) !== String(expectedRunId)) errors.push(`${gate}: runId mismatch`);
  if (manifest.gate !== gate) errors.push(`${gate}: gate identity mismatch`);
  if (manifest.status !== "success") errors.push(`${gate}: status=${manifest.status}`);
  if (!manifest.evidenceSha256) errors.push(`${gate}: evidence hash missing`);

  const evidencePath = path.join(root, gate, manifest.evidenceFile || "gate-evidence.json");
  if (!fs.existsSync(evidencePath)) {
    errors.push(`${gate}: evidence file missing`);
    continue;
  }
  const digest = crypto.createHash("sha256").update(fs.readFileSync(evidencePath)).digest("hex");
  if (digest !== manifest.evidenceSha256) errors.push(`${gate}: evidence SHA-256 mismatch`);
}

const result = {
  schemaVersion: 1,
  tool: "pdf-merge",
  expectedCommit,
  expectedRunId,
  requiredGates,
  verifiedGates: manifests.map(({ gate }) => gate).sort(),
  status: errors.length ? "REJECTED" : "CERTIFIED",
  errors,
  verifiedAt: new Date().toISOString(),
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
