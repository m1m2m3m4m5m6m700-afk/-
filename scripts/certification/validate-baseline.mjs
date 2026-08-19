import fs from 'node:fs/promises';
import { validateBaselineSchema } from './validate-baseline-schema.mjs';

export async function validateBaseline({ baseline, provenance, now = new Date() }) {
  const errors = [];
  const schemaResult = await validateBaselineSchema(baseline);
  errors.push(...schemaResult.errors.map((error) => `schema: ${error}`));

  if (baseline.status !== 'certified' || baseline.verdict !== 'CERTIFIED') errors.push('baseline is not certified');
  if (baseline.promotion?.immutable !== true) errors.push('baseline is not immutable');
  if (provenance.immutable !== true) errors.push('provenance is not immutable');
  if (baseline.baselineId !== provenance.baselineId) errors.push(`baselineId mismatch: expected ${provenance.baselineId}, found ${baseline.baselineId}`);
  if (baseline.tool !== provenance.tool) errors.push(`tool mismatch: expected ${provenance.tool}, found ${baseline.tool}`);

  const certifiedCommit = baseline.certification?.commit;
  if (!certifiedCommit) {
    errors.push('baseline missing certification.commit field');
  } else if (certifiedCommit !== provenance.sourceCommit) {
    errors.push(`certification commit mismatch: expected ${provenance.sourceCommit}, found ${certifiedCommit}`);
  }

  if (!/^sha256:[a-f0-9]{64}$/.test(provenance.sourceArtifactDigest ?? '')) errors.push('source artifact digest invalid');
  if (!/^[a-f0-9]{64}$/.test(provenance.baselineFileSha256 ?? '')) errors.push('baseline file SHA-256 invalid');

  const expiry = new Date(baseline.certification?.expiresAt ?? 'invalid');
  if (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= now.getTime()) {
    errors.push(`baseline expired or invalid expiry: ${baseline.certification?.expiresAt ?? '<missing>'}`);
  }

  return { valid: errors.length === 0, errors };
}

async function main() {
  const baselinePath = process.env.BASELINE_PATH ?? 'baselines/qr-generator/certification-baseline.json';
  const provenancePath = process.env.PROVENANCE_PATH ?? 'baselines/qr-generator/provenance.json';
  const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
  const provenance = JSON.parse(await fs.readFile(provenancePath, 'utf8'));
  const result = await validateBaseline({ baseline, provenance });

  if (!result.valid) {
    console.error('CERTIFICATION BASELINE: FAIL');
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`CERTIFICATION BASELINE: PASS (${baseline.baselineId})`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
