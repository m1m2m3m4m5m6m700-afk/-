const KNOWN_PLANS = {
  playwright: {
    category: 'ENVIRONMENT',
    rootCause: 'Playwright browser executable is missing from the runner.',
    files: ['.github/workflows/qr-independent-certification.yml'],
    changes: [{
      type: 'insert-after',
      anchor: 'npm ci --include=dev',
      content: 'npx playwright install chromium',
    }],
    validation: ['workflow syntax', 'workflow contract', 'rerun affected Windows gate'],
  },
  jsqr: {
    category: 'DEPENDENCY',
    rootCause: 'QR payload matrix imports jsqr but the dependency is not declared.',
    files: ['package.json', 'package-lock.json'],
    changes: [{
      type: 'dependency-sync',
      package: 'jsqr',
      version: '^1.4.0',
      command: 'npm install --save-dev jsqr@^1.4.0',
    }],
    validation: ['package-lock consistency', 'dependency contract', 'Node QR matrix'],
  },
  baseline: {
    category: 'CONTRACT',
    rootCause: 'Baseline validator reads the wrong certification commit path.',
    files: ['scripts/certification/validate-baseline.mjs'],
    changes: [{
      type: 'replace-path',
      from: 'baseline.certifiedCommit',
      to: 'baseline.certification.commit',
    }],
    validation: ['baseline schema', 'baseline contract tests', 'QR Fast Gate'],
  },
};

export function buildRepairPlan(diagnosis) {
  if (!diagnosis?.knownPattern) {
    return {
      version: 1,
      status: 'manual-review',
      category: diagnosis?.category ?? 'UNKNOWN',
      rootCause: diagnosis?.rootCause ?? 'Unknown failure pattern',
      files: [],
      changes: [],
      validation: ['manual root-cause review'],
    };
  }

  const template = KNOWN_PLANS[diagnosis.knownPattern];
  return {
    version: 1,
    status: 'planned',
    category: template.category,
    rootCause: template.rootCause,
    files: [...template.files],
    changes: structuredClone(template.changes),
    validation: [...template.validation],
    constraints: {
      maxAttempts: 3,
      preserveContracts: true,
      preserveToolIsolation: true,
      requireCiProof: true,
    },
  };
}

export default buildRepairPlan;
