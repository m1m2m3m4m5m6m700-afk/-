import test from 'node:test';
import assert from 'node:assert/strict';
import { planExperiments } from './index.mjs';
import { DEVELOPMENT_BRANCH, verifyHypothesis, verifyHypothesisSet } from './core/verifier.mjs';
import { executePlan } from './experimental/execute-plan.mjs';

const playwrightAndArabic = planExperiments([
  { pattern: 'arabic-test-case' },
  { pattern: 'playwright' },
], { branch: DEVELOPMENT_BRANCH });

test('v4 generates bounded hypotheses for multiple root causes', () => {
  assert.equal(playwrightAndArabic.autoApply, false);
  assert.equal(playwrightAndArabic.requiresCIProof, true);
  assert.equal(playwrightAndArabic.verification.valid, true);
});

test('development branch is explicitly allowed and apply is permitted there', () => {
  const hypothesis = playwrightAndArabic.hypotheses[0];
  const result = verifyHypothesis(hypothesis, { branch: DEVELOPMENT_BRANCH, apply: true });
  assert.equal(result.valid, true);
  assert.equal(result.allowedBranch, DEVELOPMENT_BRANCH);
  assert.equal(result.applyAllowed, true);
});

test('main and non-development branches are rejected for apply', () => {
  const hypothesis = playwrightAndArabic.hypotheses[0];
  const main = verifyHypothesis(hypothesis, { branch: 'main', apply: true });
  const other = verifyHypothesis(hypothesis, { branch: 'feature/other', apply: true });
  assert.equal(main.valid, false);
  assert.match(main.errors.join(' '), /main is protected|development branch/);
  assert.equal(other.valid, false);
  assert.match(other.errors.join(' '), /development branch/);
});

test('hypothesis set permits apply only on the development branch', () => {
  const hypotheses = playwrightAndArabic.hypotheses.slice(0, 2);
  const dev = verifyHypothesisSet(hypotheses, { branch: DEVELOPMENT_BRANCH, apply: true });
  const main = verifyHypothesisSet(hypotheses, { branch: 'main', apply: true });
  assert.equal(dev.valid, true);
  assert.equal(dev.applyAllowed, true);
  assert.equal(main.valid, false);
});

test('v4 executor accepts successful development execution', async () => {
  const calls = [];
  const runner = {
    createSandbox: async step => { calls.push(`sandbox:${step.id}`); return { step }; },
    applyStep: async () => { calls.push('apply'); },
    runCI: async () => { calls.push('ci'); return { conclusion: 'success' }; },
    rollback: async () => { calls.push('rollback'); },
    accept: async () => { calls.push('accept'); },
  };
  const decisionPackage = {
    plan: { version: 3, status: 'planned', policy: { autoApply: false }, steps: [{ id: 'step-1', gate: 'ci' }] },
    verification: { valid: true },
  };
  await assert.rejects(() => executePlan(decisionPackage, runner, { apply: true, branch: 'main' }), /development branch/);
  const accepted = await executePlan(decisionPackage, runner, { apply: true, branch: DEVELOPMENT_BRANCH });
  assert.equal(accepted.status, 'accepted');
  assert.deepEqual(calls, ['sandbox:step-1', 'apply', 'ci', 'accept']);
});

test('v4 executor rolls back failed development execution', async () => {
  const calls = [];
  const runner = {
    createSandbox: async () => { calls.push('sandbox'); return {}; },
    applyStep: async () => { calls.push('apply'); },
    runCI: async () => { calls.push('ci'); return { conclusion: 'failure' }; },
    rollback: async () => { calls.push('rollback'); },
    accept: async () => { calls.push('accept'); },
  };
  const decisionPackage = {
    plan: { version: 3, status: 'planned', policy: { autoApply: false }, steps: [{ id: 'step-1', gate: 'ci' }] },
    verification: { valid: true },
  };
  const result = await executePlan(decisionPackage, runner, { apply: true, branch: DEVELOPMENT_BRANCH });
  assert.equal(result.status, 'rolled-back');
  assert.deepEqual(calls, ['sandbox', 'apply', 'ci', 'rollback']);
});

test('v4 stays dry-run by default', async () => {
  const result = await executePlan({ plan: { version: 3, status: 'planned' }, verification: { valid: true } }, {}, {});
  assert.equal(result.status, 'dry-run');
  assert.equal(result.autoApply, false);
});
