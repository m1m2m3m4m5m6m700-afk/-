const MAX_STEPS = 6;

function step(id, title, action, validation, options = {}) {
  return {
    id,
    title,
    action,
    validation,
    dependsOn: options.dependsOn ?? [],
    gate: options.gate ?? null,
    risk: options.risk ?? 'medium',
    autoApply: options.autoApply ?? false,
  };
}

export function buildStrategicPlan(assessment) {
  const { diagnosis, dependencyImpact = {} } = assessment ?? {};
  const plans = [];

  if (!diagnosis?.known) {
    return {
      version: 1,
      status: 'manual-review',
      reason: 'No deterministic diagnosis is available.',
      steps: [],
    };
  }

  if (diagnosis.knownPattern === 'lockfile' || diagnosis.knownPattern === 'jsqr' || dependencyImpact.packageManifestChanged) {
    plans.push(step(
      'dependency-repair',
      'Synchronize dependency lockfile',
      'Run the guarded lockfile fixer; package.json remains immutable.',
      ['npm ci', 'dependency contract'],
      { gate: 'Node', risk: 'medium', autoApply: false },
    ));
  }

  if (diagnosis.knownPattern === 'playwright') {
    plans.push(step(
      'browser-environment-repair',
      'Repair Playwright browser environment',
      'Repair only through an explicit workflow change; never mutate application runtime automatically.',
      ['workflow contract', 'browser gate'],
      { gate: 'Windows', risk: 'medium', autoApply: false },
    ));
  }

  if (diagnosis.knownPattern === 'baseline') {
    plans.push(step(
      'baseline-contract-repair',
      'Correct baseline certification contract',
      'Use the canonical baseline.certification.commit field and preserve the validator contract.',
      ['baseline tests', 'certification gate'],
      { gate: 'Fast', risk: 'medium', autoApply: false },
    ));
  }

  if (diagnosis.layer === 'WORKFLOW' && !plans.length) {
    plans.push(step(
      'workflow-boundary-review',
      'Review workflow responsibility boundary',
      'Escalate for controlled human review rather than changing workflow semantics automatically.',
      ['workflow contract'],
      { gate: 'affected-gate', risk: 'high', autoApply: false },
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
