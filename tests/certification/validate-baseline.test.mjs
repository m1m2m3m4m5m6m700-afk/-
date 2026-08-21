import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import { validateBaseline } from '../../scripts/certification/validate-baseline.mjs';
import { validateBaselineSchema } from '../../scripts/certification/validate-baseline-schema.mjs';

const baseline = JSON.parse(await fs.readFile(new URL('../../baselines/qr-generator/certification-baseline.json', import.meta.url), 'utf8'));
const provenance = JSON.parse(await fs.readFile(new URL('../../baselines/qr-generator/provenance.json', import.meta.url), 'utf8'));
const now = new Date('2026-08-20T00:00:00.000Z');

function clone(value) {
  return structuredClone(value);
}

test('valid frozen baseline passes schema and semantic validation', async () => {
  const schemaResult = await validateBaselineSchema(baseline);
  assert.equal(schemaResult.valid, true, schemaResult.errors.join('\n'));

  const result = await validateBaseline({ baseline, provenance, now });
  assert.equal(result.valid, true, result.errors.join('\n'));
});

test('missing certification.commit fails with a targeted error', async () => {
  const candidate = clone(baseline);
  delete candidate.certification.commit;

  const result = await validateBaseline({ baseline: candidate, provenance, now });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('missing certification.commit')));
});

test('mismatched certification commit fails with expected and found values', async () => {
  const candidate = clone(baseline);
  candidate.certification.commit = '0123456789abcdef0123456789abcdef01234567';

  const result = await validateBaseline({ baseline: candidate, provenance, now });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('certification commit mismatch')));
  assert.ok(result.errors.some((error) => error.includes(provenance.sourceCommit)));
});

test('expired baseline fails with its actual expiry value', async () => {
  const candidate = clone(baseline);
  candidate.certification.expiresAt = '2026-08-19T17:57:36.588Z';

  const result = await validateBaseline({ baseline: candidate, provenance, now });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('baseline expired or invalid expiry')));
});

test('schema rejects malformed certification metadata before semantic checks', async () => {
  const candidate = clone(baseline);
  candidate.certification.runId = 'not-a-run-id';

  const result = await validateBaseline({ baseline: candidate, provenance, now });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('schema: baseline.certification.runId')));
});
