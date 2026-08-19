import fs from "node:fs/promises";
import path from "node:path";
import { computeSha256 } from "./create-gate-manifest.mjs";

const COMMIT = /^[a-f0-9]{40}$/;

export async function verifyGateManifest(manifest, {
  evidencePath,
  expectedCommit = process.env.GITHUB_SHA ?? null,
  expectedRunId = process.env.GITHUB_RUN_ID ?? null,
  now = new Date(),
} = {}) {
  const errors = [];
  if (!manifest || manifest.schemaVersion !== 1) errors.push("unsupported schemaVersion");
  if (!manifest?.tool || !manifest?.gate) errors.push("tool/gate missing");
  if (!COMMIT.test(manifest?.commit ?? "")) errors.push("invalid commit");
  if (!/^\d+$/.test(String(manifest?.runId ?? ""))) errors.push("invalid runId");
  if (!manifest?.evidence?.sha256) errors.push("evidence hash missing");

  const resolvedEvidencePath = evidencePath ??
    (manifest?.evidence?.file ? path.join(path.dirname(manifest.__path ?? ""), manifest.evidence.file) : null);

  let hashMatch = false;
  if (resolvedEvidencePath) {
    try {
      const digest = await computeSha256(resolvedEvidencePath);
      hashMatch = digest === manifest.evidence.sha256;
      if (!hashMatch) errors.push("evidence SHA-256 mismatch");
    } catch (error) {
      errors.push(`evidence unreadable: ${error.message}`);
    }
  } else {
    errors.push("evidence path missing");
  }

  const commitMatch = !expectedCommit || manifest.commit === expectedCommit;
  const runMatch = !expectedRunId || String(manifest.runId) === String(expectedRunId);
  const expiresAt = new Date(manifest.expiresAt ?? "invalid");
  const notExpired = Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() > now.getTime();
  if (!commitMatch) errors.push("commit mismatch");
  if (!runMatch) errors.push("runId mismatch");
  if (!notExpired) errors.push("manifest expired or invalid expiry");
  if (manifest.status !== "success") errors.push(`gate status is ${manifest.status}`);

  return {
    valid: errors.length === 0,
    errors,
    integrity: {
      commitMatch,
      runMatch,
      hashMatch,
      notExpired,
      valid: errors.length === 0,
    },
  };
}

export async function readAndVerifyGateManifest(manifestPath, options = {}) {
  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  manifest.__path = manifestPath;
  const result = await verifyGateManifest(manifest, options);
  return { manifest, ...result };
}
