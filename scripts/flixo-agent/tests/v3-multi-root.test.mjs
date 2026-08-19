import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnoseAll } from '../v3/core/diagnose.mjs';
import { buildStrategicPlan, nextEligibleStep } from '../v3/planning/strategic-planner.mjs';
import { diagnose as diagnoseV1 } from '../v1/core/diagnose.mjs';
import { diagnose as diagnoseV2 } from '../v2/core/diagnose.mjs';

test('v1 recognizes arabic test-contract failure', () => {
  const result = diagnoseV1('Error: Unknown TEST_CASE: arabic. Expected one of: url, text');
  assert.equal(result.known, true);
  assert.equal(result.pattern, 'arabic-test-case');
  assert.equal(result.category, 'TEST_CONTRACT');
});

test('v2 recognizes arabic test-contract failure', () => {
  const result = diagnoseV2('Unknown TEST_CASE: arabic');
  assert.equal(result.known, true);
  assert.equal(result.pattern, 'arabic-test-case');
  assert.equal(result.category, 'TEST_CONTRACT');
});

test('v3 collects all root causes from a combined CI log', () => {
  const log = [
    "Error: browserType.launch: Executable doesn't exist at ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell.exe",
    'Error: Unknown TEST_CASE: arabic. Expected one of: url, text, wifi',
  ].join('\n');
  const roots = diagnoseAll(log);
  assert.deepEqual(roots.map((r) => r.pattern), ['playwright', 'arabic-test-case']);
});

test('v3 creates an ordered multi-root plan with CI dependencies', () => {
  const roots = [
    { known: true, pattern: 'playwright', category: 'ENVIRONMENT' },
    { known: true, pattern: 'arabic-test-case', category: 'TEST_CONTRACT' },
  ];
  const plan = buildStrategicPlan(roots);
  assert.equal(plan.status, 'planned');
  assert.equal(plan.steps.length, 2);
  assert.equal(plan.steps[0].rootCause, 'arabic-test-case');
  assert.equal(plan.steps[1].rootCause, 'playwright');
  assert.deepEqual(plan.steps[0].dependsOn, []);
  assert.deepEqual(plan.steps[1].dependsOn, [plan.steps[0].id]);
  assert.equal(nextEligibleStep(plan)?.id, plan.steps[0].id);
  assert.equal(plan.policy.ciRequiredBetweenSteps, true);
  assert.equal(plan.policy.autoApply, false);
});
