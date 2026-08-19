import fs from 'node:fs/promises';

const baselinePath = process.env.BASELINE_PATH ?? 'baselines/qr-generator/certification-baseline.json';
const provenancePath = process.env.PROVENANCE_PATH ?? 'baselines/qr-generator/provenance.json';

const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
const provenance = JSON.parse(await fs.readFile(provenancePath, 'utf8'));
const errors = [];

if (baseline.status !== 'certified' || baseline.verdict !== 'CERTIFIED') errors.push('baseline is not certified');
if (baseline.promotion?.immutable !== true) errors.push('baseline is not immutable');
if (provenance.immutable !== true) errors.push('provenance is not immutable');
if (baseline.baselineId !== provenance.baselineId) errors.push('baselineId mismatch');
if (baseline.tool !== provenance.tool) errors.push('tool mismatch');
if (!baseline.certification?.commit) {
  errors.push('baseline missing certification.commit field');
} else if (baseline.certification.commit !== provenance.sourceCommit) {
  errors.push('certification commit mismatch');
}
if (!/^sha256:[a-f0-9]{64}$/.test(provenance.sourceArtifactDigest ?? '')) errors.push('source artifact digest invalid');
if (!/^[a-f0-9]{64}$/.test(provenance.baselineFileSha256 ?? '')) errors.push('baseline file SHA-256 invalid');
const expiry = new Date(baseline.certification?.expiresAt ?? baseline.expiresAt ?? 'invalid');
if (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now()) errors.push('baseline expired or invalid expiry');

if (errors.length) {
  console.error('CERTIFICATION BASELINE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`CERTIFICATION BASELINE: PASS (${baseline.baselineId})`);
