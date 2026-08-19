const TEMPLATES = {
  jsqr: [
    { id: 'jsqr-devdependency', description: 'Add jsqr as a devDependency and synchronize package-lock.json.', category: 'DEPENDENCY', risk: 'low', changes: [{ file: 'package.json', type: 'dependency-sync', package: 'jsqr', version: '^1.4.0', scope: 'dev' }] },
    { id: 'jsqr-runtime-dependency', description: 'Add jsqr as a runtime dependency.', category: 'DEPENDENCY', risk: 'medium', changes: [{ file: 'package.json', type: 'dependency-sync', package: 'jsqr', version: '^1.4.0', scope: 'runtime' }] }
  ],
  playwright: [
    { id: 'playwright-chromium', description: 'Install Playwright Chromium before Windows smoke tests.', category: 'ENVIRONMENT', risk: 'low', changes: [{ file: '.github/workflows/qr-independent-certification.yml', type: 'insert-after', anchor: 'npm ci --include=dev', content: 'npx playwright install chromium' }] },
    { id: 'playwright-headless-shell', description: 'Install the Chromium headless shell before Windows smoke tests.', category: 'ENVIRONMENT', risk: 'medium', changes: [{ file: '.github/workflows/qr-independent-certification.yml', type: 'insert-after', anchor: 'npm ci --include=dev', content: 'npx playwright install --with-deps chromium-headless-shell' }] }
  ],
  'arabic-test-case': [
    { id: 'arabic-add-case', description: 'Add an explicit arabic test case to the payload matrix.', category: 'TEST_CONTRACT', risk: 'low', changes: [{ file: 'scripts/test-qr-payload-matrix.mjs', type: 'test-data', testCase: 'arabic' }] },
    { id: 'arabic-remove-matrix-entry', description: 'Remove the stale arabic entry from the CI matrix.', category: 'WORKFLOW', risk: 'medium', changes: [{ file: '.github/workflows/qr-independent-certification.yml', type: 'matrix-remove', testCase: 'arabic' }] }
  ]
};

export function generateHypotheses(rootCause, { max = 3 } = {}) {
  const candidates = TEMPLATES[rootCause] ?? [];
  return candidates.slice(0, Math.max(0, Math.min(3, max))).map((candidate, index) => ({
    ...candidate,
    experimentId: `exp-${index + 1}-${candidate.id}`,
    requiresSandbox: true,
    requiresCIProof: true,
    autoApply: false,
  }));
}

export function generateForRoots(roots, options = {}) {
  return roots.flatMap(root => generateHypotheses(root.pattern ?? root, options));
}
