import test from 'node:test';
import assert from 'node:assert/strict';
import { planExperiments } from './index.mjs';

const playwrightAndArabic = planExperiments([
  { pattern: 'arabic-test-case' },
  { pattern: 'playwright' },
], { branch: 'feat/certification-foundation-pdf-merge' });

test('v4 generates bounded hypotheses for multiple root causes', () => {
  assert.equal(playwrightAndArabic.hypotheses.length, 4);
  assert.equal(playwrightAndArabic.autoApply, false);
  assert.equal(playwrightAndArabic.requiresCIProof, true);
  assert.equal(playwrightAndArabic.verification.valid, true);
});

test('v4 refuses main and apply mode', () => {
  const mainPlan = planExperiments([{ pattern: 'jsqr' }], { branch: 'main' });
  assert.equal(mainPlan.verification.valid, false);
  const errorText = mainPlan.verification.errors.join(' ');
  assert.match(errorText, /main is protected/);
});

test('v4 caps experiments at three per root cause', () => {
  const plan = planExperiments([{ pattern: 'playwright' }], { maxExperimentsPerRootCause: 99 });
  assert.ok(plan.hypotheses.length <= 3);
});
