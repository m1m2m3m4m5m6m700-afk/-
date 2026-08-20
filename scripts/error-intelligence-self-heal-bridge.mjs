import fs from 'node:fs/promises';

const reportPath = process.env.ERROR_REPORT_PATH ?? '.artifacts/errors/error-report.json';
const out = process.env.SELF_HEAL_SUGGESTION_OUT ?? '.artifacts/errors/self-heal-suggestion.json';
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
const result = {
  schemaVersion: 1,
  source: 'error-intelligence-engine',
  fingerprint: report.fingerprint,
  suggestedAction: report.recommendation ?? null,
  rootCauseCode: report.rootCauseCode ?? 'unclassified',
  confidence: report.diagnosisConfidence ?? 0,
  candidateFix: null,
  executionMode: 'advisory-only',
  autoApply: false,
  requiresHumanReview: true,
  protectedBranchPolicy: 'experimental-only',
};
await fs.mkdir('.artifacts/errors', { recursive: true });
await fs.writeFile(out, JSON.stringify(result, null, 2));
console.log(`SELF-HEAL SUGGESTION: ${out}`);
