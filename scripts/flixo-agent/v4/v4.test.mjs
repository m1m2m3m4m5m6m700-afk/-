import test from 'node:test';
import assert from 'node:assert/strict';
import { planExperiments } from './index.mjs';
import { DEVELOPMENT_BRANCH, verifyHypothesis } from './core/verifier.mjs';
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

test('development branch is explicitly allowed', () => {
  const hypothesis = playwrightAndArabic.hypotheses[0];
  const result = verifyHypothesis(hypothesis, { branch: DEVELOPMENT_BRANCH });
  assert.equal(result.valid, true);
  assert.equal(result.allowedBranch, DEVELOPMENT_BRANCH);
});

test('main and non-development branches are rejected for apply', () => {
  const hypothesis = playwrightAndArabic.hypotheses[0];
  const main = verifyHypothesis(hypothesis, { branch: 'main' });
  const other = verifyHypothesis(hypothesis, { branch: 'feature/other', apply: true });
  assert.equal(main.valid, false);
  assert.match(main.errors.join(' '), /main is protected/);
  assert.equal(other.valid, false);
  assert.match(other.errors.join(' '), /development branch/);
});

test('v4 executor requires the development branch for real execution', async () => {
  const runner = {
    createSandbox: async step => ({ step }),
    applyStep: async () => {},
    runCI: async () => ({ conclusion: 'success' }),
    rollback: async () => {},
    accept: async () => {},
  };
  const decisionPackage = {
    plan: { version: 3, status: 'planned', policy: { autoApply: false }, steps: [{ id: 'step-1', gate: 'ci' }] },
    verification: { valid: true },
  };
  await assert.rejects(() => executePlan(decisionPackage, runner, { apply: true, branch: 'main' }), /development branch/);
  const accepted = await executePlan(decisionPackage, runner, { apply: true, branch: DEVELOPMENT_BRANCH });
  assert.equal(accepted.status, 'accepted');
  assert.equal(accepted.developmentBranch, DEVELOPMENT_BRANCH);
});

test('v4 stays dry-run by default', async () => {
  const result = await executePlan({ plan: { version: 3, status: 'planned' }, verification: { valid: true } }, {}, {});
  assert.equal(result.status, 'dry-run');
  assert.equal(result.autoApply, false);
});
