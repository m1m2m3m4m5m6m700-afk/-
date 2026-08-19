import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createGateManifest } from './create-gate-manifest.mjs';
import { validateGateManifestSchema } from './validate-gate-manifest-schema.mjs';
import { verifyGateManifest } from './verify-gate-manifest.mjs';

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'flixo-cert-'));
try {
  const evidencePath = path.join(dir, 'gate-evidence.json');
  await fs.writeFile(evidencePath, JSON.stringify({ ok: true, gate: 'smoke' }) + '\n');
  const commit = '0123456789abcdef0123456789abcdef01234567';
  const runId = '1';
  const manifest = await createGateManifest({
    tool: 'smoke-tool', gate: 'fast', status: 'success', commit, runId,
    evidencePath, expectedCommit: commit, expectedRunId: runId,
    now: new Date('2026-08-19T00:00:00.000Z')
  });
  const schemaResult = await validateGateManifestSchema(manifest);
  assert.equal(schemaResult.valid, true, schemaResult.errors.join('\n'));
  const result = await verifyGateManifest(manifest, {
    evidencePath,
    expectedCommit: commit,
    expectedRunId: runId,
    now: new Date('2026-08-19T00:01:00.000Z')
  });
  assert.equal(result.valid, true);
  assert.equal(result.integrity.valid, true);
  console.log('CERTIFICATION SMOKE TEST: PASS');
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
