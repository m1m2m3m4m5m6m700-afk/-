export const FAILURE_LAYERS = Object.freeze({
  ENVIRONMENT: 'ENVIRONMENT',
  CONTRACT: 'CONTRACT',
  DEPENDENCY: 'DEPENDENCY',
  LOGIC: 'LOGIC',
  WORKFLOW: 'WORKFLOW',
  POLICY: 'POLICY',
  EXTERNAL: 'EXTERNAL',
  UNKNOWN: 'UNKNOWN',
});

const RULES = [
  {
    id: 'playwright-missing-browser',
    layer: FAILURE_LAYERS.ENVIRONMENT,
    pattern: /(Executable doesn't exist at|browserType\.launch).*?(chrome-headless-shell|playwright)/i,
    summary: 'Playwright browser executable is missing from the runner.',
    recommendation: 'Install the required Playwright browser in the affected workflow after dependency installation and before browser tests.',
  },
  {
    id: 'missing-jsqr',
    layer: FAILURE_LAYERS.DEPENDENCY,
    pattern: /(Cannot find module [\'\"]jsqr[\'\"]|Cannot find package [\'\"]jsqr[\'\"])/i,
    summary: 'QR Node certification requires jsqr but the dependency is unavailable.',
    recommendation: 'Declare jsqr in package.json and update package-lock.json together; do not patch only the workflow.',
  },
  {
    id: 'vite-missing',
    layer: FAILURE_LAYERS.DEPENDENCY,
    pattern: /(?:vite: not found|Cannot find (?:module|package).*vite)/i,
    summary: 'Vite is unavailable to a certification job that requires development tooling.',
    recommendation: 'Verify devDependencies and the lockfile, then ensure the job installs dev dependencies with npm ci --include=dev.',
  },
  {
    id: 'playwright-package-missing',
    layer: FAILURE_LAYERS.DEPENDENCY,
    pattern: /Cannot find (?:module|package).*playwright/i,
    summary: 'Playwright package is unavailable to the certification job.',
    recommendation: 'Verify @playwright/test/playwright declarations, lockfile integrity, and npm ci --include=dev.',
  },
  {
    id: 'baseline-commit-path',
    layer: FAILURE_LAYERS.CONTRACT,
    pattern: /certification commit mismatch/i,
    summary: 'Baseline commit validation is failing.',
    recommendation: 'Compare baseline.certification.commit with provenance.sourceCommit and verify the validator uses the schema-defined path.',
  },
  {
    id: 'baseline-expiry',
    layer: FAILURE_LAYERS.CONTRACT,
    pattern: /(baseline expired|invalid expiry|expiresAt)/i,
    summary: 'Baseline expiry validation is failing or reporting malformed expiry data.',
    recommendation: 'Read expiry from baseline.certification.expiresAt and verify it against a real ISO timestamp.',
  },
  {
    id: 'qr-in-pdf-windows',
    layer: FAILURE_LAYERS.WORKFLOW,
    pattern: /(Windows.*QR|Run Windows QR functional tests|QR Generator.*Windows)/i,
    summary: 'QR certification responsibilities appear inside the PDF/Windows gate.',
    recommendation: 'Keep PDF Windows responsibilities limited to PDF/Desktop tests and run QR certification in its dedicated workflow.',
  },
  {
    id: 'package-lock-mismatch',
    layer: FAILURE_LAYERS.CONTRACT,
    pattern: /(package-lock|out of date.*lockfile|npm ci.*lock)/i,
    summary: 'package.json and package-lock.json are not aligned.',
    recommendation: 'Update both files together using npm install and rerun the repository dependency contract checks.',
  },
  {
    id: 'vercel-external-limit',
    layer: FAILURE_LAYERS.EXTERNAL,
    pattern: /api-deployments-free-per-day|deployment.*limit/i,
    summary: 'External Vercel deployment quota/limit failure detected.',
    recommendation: 'Keep this failure separate from application certification unless the certification contract explicitly includes Vercel.',
  },
];

export function diagnose(log) {
  const text = String(log ?? '');
  const match = RULES.find((rule) => rule.pattern.test(text));

  if (!match) {
    return {
      known: false,
      layer: FAILURE_LAYERS.UNKNOWN,
      ruleId: null,
      summary: 'No known failure signature matched the supplied log.',
      recommendation: 'Collect the first failing job/step and inspect the relevant contract, workflow, environment, and source before editing.',
    };
  }

  return {
    known: true,
    layer: match.layer,
    ruleId: match.id,
    summary: match.summary,
    recommendation: match.recommendation,
  };
}

export function knownRules() {
  return RULES.map(({ id, layer, summary }) => ({ id, layer, summary }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv.slice(2).join(' ');
  process.stdout.write(JSON.stringify(diagnose(input), null, 2) + '\n');
}
