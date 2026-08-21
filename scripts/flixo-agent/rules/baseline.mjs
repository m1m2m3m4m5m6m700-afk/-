export const baselineRules = Object.freeze([
  {
    id: 'baseline-commit-path',
    knownPattern: 'baseline',
    layer: 'CONTRACT',
    pattern: /certification commit mismatch/i,
    summary: 'Baseline commit validation is failing.',
    recommendation: 'Compare baseline.certification.commit with provenance.sourceCommit and verify the validator uses the schema-defined path.',
  },
  {
    id: 'baseline-expiry',
    knownPattern: null,
    layer: 'CONTRACT',
    pattern: /(baseline expired|invalid expiry|expiresAt)/i,
    summary: 'Baseline expiry validation is failing or reporting malformed expiry data.',
    recommendation: 'Read expiry from baseline.certification.expiresAt and verify it against a real ISO timestamp.',
  },
]);

export function matchBaselineRule(log) {
  const text = String(log ?? '');
  return baselineRules.find((rule) => rule.pattern.test(text)) ?? null;
}
