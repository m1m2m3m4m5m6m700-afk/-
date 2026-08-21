import { dependencyRules, matchDependencyRule } from './rules/dependencies.mjs';
import { baselineRules, matchBaselineRule } from './rules/baseline.mjs';

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

const CORE_RULES = [
  {
    id: 'playwright-missing-browser',
    knownPattern: 'playwright',
    layer: FAILURE_LAYERS.ENVIRONMENT,
    pattern: /(Executable doesn't exist at|browserType\.launch).*?(chrome-headless-shell|playwright)/i,
    summary: 'Playwright browser executable is missing from the runner.',
    recommendation: 'Install the required Playwright browser in the affected workflow after dependency installation and before browser tests.',
  },
  {
    id: 'qr-in-pdf-windows',
    knownPattern: null,
    layer: FAILURE_LAYERS.WORKFLOW,
    pattern: /(Windows.*QR|Run Windows QR functional tests|QR Generator.*Windows)/i,
    summary: 'QR certification responsibilities appear inside the PDF/Windows gate.',
    recommendation: 'Keep PDF Windows responsibilities limited to PDF/Desktop tests and run QR certification in its dedicated workflow.',
  },
  {
    id: 'vercel-external-limit',
    knownPattern: null,
    layer: FAILURE_LAYERS.EXTERNAL,
    pattern: /api-deployments-free-per-day|deployment.*limit/i,
    summary: 'External Vercel deployment quota/limit failure detected.',
    recommendation: 'Keep this failure separate from application certification unless the certification contract explicitly includes Vercel.',
  },
];

const RULES = [...dependencyRules, ...baselineRules, ...CORE_RULES];

export function diagnose(log) {
  const text = String(log ?? '');
  const specialized = matchDependencyRule(text) ?? matchBaselineRule(text);
  const match = specialized ?? RULES.find((rule) => rule.pattern.test(text));

  if (!match) {
    return {
      known: false,
      knownPattern: null,
      layer: FAILURE_LAYERS.UNKNOWN,
      ruleId: null,
      summary: 'No known failure signature matched the supplied log.',
      recommendation: 'Collect the first failing job/step and inspect the relevant contract, workflow, environment, and source before editing.',
    };
  }

  return {
    known: true,
    knownPattern: match.knownPattern ?? null,
    layer: match.layer,
    ruleId: match.id,
    summary: match.summary,
    recommendation: match.recommendation,
  };
}

export function knownRules() {
  return RULES.map(({ id, knownPattern, layer, summary }) => ({ id, knownPattern, layer, summary }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv.slice(2).join(' ');
  process.stdout.write(JSON.stringify(diagnose(input), null, 2) + '\n');
}
