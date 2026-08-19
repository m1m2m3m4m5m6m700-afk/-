const PLANS = {
  playwright: { category: 'ENVIRONMENT', file: '.github/workflows/qr-independent-certification.yml', type: 'insert-after', anchor: 'npm ci --include=dev', content: 'npx playwright install chromium' },
  baseline: { category: 'CONTRACT', file: 'scripts/certification/validate-baseline.mjs', type: 'replace', find: 'baseline.certifiedCommit', content: 'baseline.certification.commit' },
  jsqr: { category: 'DEPENDENCY', file: 'package.json', type: 'dependency-sync', package: 'jsqr', version: '^1.4.0' },
  'arabic-test-case': { category: 'TEST_CONTRACT', files: ['.github/workflows/qr-independent-certification.yml', 'scripts/test-qr-payload-matrix.mjs'], type: 'test-contract-sync', case: 'arabic', content: 'Define arabic as an explicit matrix/test case with the expected Arabic payload.' },
};
export function plan(diagnosis) {
  const template = PLANS[diagnosis?.pattern];
  if (!template) return { status: 'manual-review', category: diagnosis?.category ?? 'UNKNOWN', changes: [] };
  return { status: 'planned', version: 1, category: template.category, changes: [structuredClone(template)], autoApply: false };
}
