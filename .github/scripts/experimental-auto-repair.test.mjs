import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ALLOWED_PATHS,
  MIN_CONFIDENCE,
  TARGET_BRANCH,
  allowedChangedPaths,
  isRepairEligible,
  selectRepair,
} from './experimental-auto-repair.mjs';

const safeIssue = {
  id: 'R010',
  recommendedStrategy: 'lockfile-fixer',
  confidence: MIN_CONFIDENCE,
  autoApplyAllowed: true,
};

const safeReport = {
  headBranch: TARGET_BRANCH,
  baseRef: TARGET_BRANCH,
  decision: 'candidate-for-safe-dry-run',
  issues: [safeIssue],
};

test('accepts only experimental source reports with an explicitly allowed safe fixer', () => {
  assert.equal(isRepairEligible(safeReport), true);
  assert.equal(selectRepair(safeReport), safeIssue);
});

test('rejects a report that is not explicitly auto-apply allowed', () => {
  const report = { ...safeReport, issues: [{ ...safeIssue, autoApplyAllowed: false }] };
  assert.equal(isRepairEligible(report), false);
  assert.equal(selectRepair(report), null);
});

test('rejects a main source branch', () => {
  assert.equal(isRepairEligible({ ...safeReport, headBranch: 'main' }), false);
});

test('rejects low-confidence repair candidates', () => {
  assert.equal(isRepairEligible({
    ...safeReport,
    issues: [{ ...safeIssue, confidence: MIN_CONFIDENCE - 0.01 }],
  }), false);
});

test('rejects strategies outside the allow-list', () => {
  assert.equal(isRepairEligible({
    ...safeReport,
    issues: [{ ...safeIssue, recommendedStrategy: 'playwright-fixer' }],
  }), false);
});

test('rejects empty repair path sets', () => {
  assert.equal(allowedChangedPaths([]), false);
});

test('allows only package-lock.json mutations', () => {
  assert.equal(allowedChangedPaths([...ALLOWED_PATHS]), true);
  assert.equal(allowedChangedPaths(['package-lock.json', 'src/app.ts']), false);
});
