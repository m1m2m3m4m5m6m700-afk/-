import fs from 'node:fs/promises';
import { computeSha256 } from './create-gate-manifest.mjs';
import { assertGateManifestSchema } from './validate-gate-manifest-schema.mjs';

const COMMIT = /^[a-f0-9]{40}$/;

export async function verifyGateManifest(manifest, { evidencePath, expectedCommit = null, expectedRunId = null, now = new Date() } = {}) {
  const errors = [];

  try {
    await assertGateManifestSchema(manifest);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  if (!manifest || manifest.schemaVersion !== 1) errors.push('unsupported schemaVersion');
  if (!manifest?.tool || !manifest?.gate) errors.push('tool/gate missing');
  if (!COMMIT.test(manifest?.commit ?? '')) errors.push('invalid commit');
  if (!/^\d+$/.test(String(manifest?.runId ?? ''))) errors.push('invalid runId');
  if (manifest?.status !== 'success') errors.push(`gate status is ${manifest?.status}`);
  if (!manifest?.evidence?.sha256) errors.push('evidence hash missing');

  let hashMatch = false;
  try {
    hashMatch = (await computeSha256(evidencePath)) === manifest.evidence.sha256;
    if (!hashMatch) errors.push('evidence SHA-256 mismatch');
  } catch (error) {
    errors.push(`evidence unreadable: ${error.message}`);
  }

  const commitMatch = !expectedCommit || manifest.commit === expectedCommit;
  const runMatch = !expectedRunId || String(manifest.runId) === String(expectedRunId);
  const expiresAt = new Date(manifest.expiresAt ?? 'invalid');
  const notExpired = Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() > now.getTime();
  if (!commitMatch) errors.push('commit mismatch');
  if (!runMatch) errors.push('runId mismatch');
  if (!notExpired) errors.push('manifest expired or invalid expiry');

  return { valid: errors.length === 0, errors, integrity: { commitMatch, runMatch, hashMatch, notExpired, valid: errors.length === 0 } };
}

export async function readAndVerifyGateManifest(manifestPath, options = {}) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const result = await verifyGateManifest(manifest, options);
  return { manifest, ...result };
}
