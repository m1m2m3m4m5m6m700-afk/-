import assert from 'node:assert/strict';
import test from 'node:test';
import { detectV1 } from '../v1/index.mjs';
import { detectV2 } from '../v2/index.mjs';
import { diagnoseAll } from '../v3/core/diagnose.mjs';
import { buildStrategicPlan } from '../v3/planning/strategic-planner.mjs';
import { verify } from '../v3/core/verifier.mjs';
import { DEVELOPMENT_BRANCH } from '../v4/core/verifier.mjs';
import { executePlan, validateV3PlanForExecution } from '../v4/experimental/execute-plan.mjs';

const LOG = [
  "Error: browserType.launch: Executable doesn't exist at chrome-headless-shell.exe",
  "Error: Unknown TEST_CASE: arabic",
].join('\n');

function fakeRunner(conclusion) {
  const events = [];
  return {
    events,
    async createSandbox(step) { events.push(['sandbox', step.id]); return { step: step.id }; },
    async applyStep(sandbox, step) { events.push(['apply', sandbox.step, step.rootCause]); },
    async runCI(sandbox, step) { events.push(['ci', sandbox.step]); return { conclusion, step: step.id }; },
    async accept(sandbox, step) { events.push(['accept', sandbox.step, step.id]); },
    async rollback(sandbox, step) { events.push(['rollback', sandbox.step, step.id]); },
  };
}

test('v1/v2 observe, v3 decides, v4 acts on development branch', async () => {
  const v1 = detectV1(LOG);
  const v2 = await detectV2(LOG);
  assert.equal(v1.role, 'DETECT');
  assert.equal(v2.role, 'DETECT_CONTEXT');
  assert.equal('plan' in v1, false);
  assert.equal('plan' in v2, false);
  assert.equal('verification' in v1, false);
  assert.equal('verification' in v2, false);

  const roots = diagnoseAll(LOG);
  assert.deepEqual(roots.map((r) => r.pattern), ['playwright', 'arabic-test-case']);

  const plan = buildStrategicPlan(roots);
  assert.equal(plan.version, 3);
  assert.equal(plan.status, 'planned');
  assert.equal(plan.steps.length, 2);
  assert.equal(plan.steps[1].dependsOn[0], plan.steps[0].id);
  const verification = verify(plan);
  assert.equal(verification.valid, true);
  assert.equal(verification.approved, false);

  const decisionPackage = { plan, verification };
  const gate = validateV3PlanForExecution(decisionPackage);
  assert.equal(gate.valid, true);

  const dryRun = await executePlan(decisionPackage, fakeRunner('success'), { apply: false, branch: DEVELOPMENT_BRANCH });
  assert.equal(dryRun.status, 'dry-run');
  assert.equal(dryRun.developmentBranch, DEVELOPMENT_BRANCH);

  const successRunner = fakeRunner('success');
  const success = await executePlan(decisionPackage, successRunner, { apply: true, branch: DEVELOPMENT_BRANCH });
  assert.equal(success.status, 'accepted');
  assert.equal(successRunner.events.filter((e) => e[0] === 'ci').length, 2);
  assert.equal(successRunner.events.some((e) => e[0] === 'accept'), true);

  const failureRunner = fakeRunner('failure');
  const failed = await executePlan(decisionPackage, failureRunner, { apply: true, branch: DEVELOPMENT_BRANCH });
  assert.equal(failed.status, 'rolled-back');
  assert.equal(failureRunner.events.some((e) => e[0] === 'rollback'), true);
  assert.equal(failureRunner.events.some((e) => e[0] === 'accept'), false);
});

test('v4 rejects execution outside the development branch', async () => {
  const roots = diagnoseAll(LOG);
  const plan = buildStrategicPlan(roots);
  const verification = verify(plan);
  const decisionPackage = { plan, verification };
  await assert.rejects(
    () => executePlan(decisionPackage, fakeRunner('success'), { apply: true, branch: 'main' }),
    /development branch/
  );
  await assert.rejects(
    () => executePlan(decisionPackage, fakeRunner('success'), { apply: true, branch: 'feature/other' }),
    /development branch/
  );
});

test('v4 rejects an unverified or non-v3 package', async () => {
  const runner = fakeRunner('success');
  await assert.rejects(() => executePlan({ plan: { version: 3, status: 'planned', steps: [], policy: { autoApply: false } }, verification: { valid: false } }, runner, { apply: true, branch: DEVELOPMENT_BRANCH }));
  await assert.rejects(() => executePlan({ plan: { version: 2, status: 'planned', steps: [] }, verification: { valid: true } }, runner, { apply: true, branch: DEVELOPMENT_BRANCH }));
});
