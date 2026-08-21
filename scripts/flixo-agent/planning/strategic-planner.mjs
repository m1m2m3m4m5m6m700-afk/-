const MAX_STEPS = 6;

function makeStep(id, title, action, validation, options = {}) {
  return {
    id,
    title,
    action,
    validation,
    dependsOn: options.dependsOn ?? [],
    gate: options.gate ?? null,
    risk: options.risk ?? 'medium',
    autoApply: false,
  };
}

export function buildStrategicPlan(assessment = {}) {
  const { diagnosis, dependencyImpact = {} } = assessment;
  const plans = [];

  if (!diagnosis?.known) {
    return {
      version: 1,
      status: 'manual-review',
      reason: 'No deterministic diagnosis is available.',
      steps: [],
      policy: { ciRequiredBetweenSteps: true, maxAttemptsPerRootCause: 3, autoApply: false },
    };
  }

  if (diagnosis.knownPattern === 'jsqr' || dependencyImpact.packageManifestChanged) {
    plans.push(makeStep(
      'dependency-repair',
      'Synchronize required development dependency',
      'Use dependency-executor in sandbox mode to update package.json and package-lock.json atomically.',
      ['dependency contract', 'npm lockfile consistency', 'targeted Node test'],
      { gate: 'Node', risk: 'medium' },
    ));
  }

  if (diagnosis.knownPattern === 'playwright') {
    plans.push(makeStep(
      'browser-environment-repair',
      'Install required Playwright browser binary',
      'Add the browser installation step to the affected workflow after dependency installation and before browser tests.',
      ['workflow scope', 'YAML validation', 'Windows Smoke'],
      { gate: 'Windows', risk: 'low' },
    ));
  }

  if (diagnosis.knownPattern === 'baseline') {
    plans.push(makeStep(
      'baseline-contract-repair',
      'Correct baseline certification field usage',
      'Use baseline.certification.commit and preserve schema/validator contract.',
      ['baseline contract tests', 'Fast Gate'],
      { gate: 'Fast', risk: 'medium' },
    ));
  }

  if (diagnosis.layer === 'WORKFLOW' && !plans.length) {
    plans.push(makeStep(
      'workflow-boundary-review',
      'Repair workflow responsibility boundaries',
      'Move only the affected tool responsibilities to the correct certification workflow.',
      ['workflow contract', 'affected gate'],
      { gate: 'affected-gate', risk: 'medium' },
    ));
  }

  const bounded = plans.slice(0, MAX_STEPS);
  for (let index = 1; index < bounded.length; index += 1) {
    bounded[index].dependsOn = [bounded[index - 1].id];
  }

  return {
    version: 1,
    status: bounded.length ? 'planned' : 'manual-review',
    steps: bounded,
    policy: {
      ciRequiredBetweenSteps: true,
      maxAttemptsPerRootCause: 3,
      autoApply: false,
    },
  };
}

export function nextEligibleStep(plan, completedStepIds = [], failedStepIds = []) {
  const completed = new Set(completedStepIds);
  const failed = new Set(failedStepIds);
  return (plan?.steps ?? []).find((candidate) => {
    if (completed.has(candidate.id) || failed.has(candidate.id)) return false;
    return (candidate.dependsOn ?? []).every((dependency) => completed.has(dependency));
  }) ?? null;
}
