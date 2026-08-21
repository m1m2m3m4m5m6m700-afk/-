import fs from 'node:fs/promises';

const reportPath = process.env.ERROR_REPORT_PATH ?? '.artifacts/errors/error-report.json';
const out = process.env.V3_DIAGNOSIS_OUT ?? '.artifacts/errors/v3-diagnosis-input.json';
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
const result = {
  schemaVersion: 1,
  source: 'error-intelligence-engine',
  fingerprint: report.fingerprint,
  rootCauseCode: report.rootCauseCode,
  rootCause: report.rootCause,
  recommendation: report.recommendation,
  diagnosisConfidence: report.diagnosisConfidence,
  affectedFiles: report.affectedFiles ?? [],
  memoryHit: report.memory?.hit ?? false,
  planOnly: true,
  autoApply: false,
  requiresHumanReview: true,
};
await fs.mkdir('.artifacts/errors', { recursive: true });
await fs.writeFile(out, JSON.stringify(result, null, 2));
console.log(`V3 DIAGNOSIS INPUT: ${out}`);
