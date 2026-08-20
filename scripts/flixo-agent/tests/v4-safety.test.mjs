import test from 'node:test';
import assert from 'node:assert/strict';
import { isRepairEligible, selectRepair, allowedChangedPaths, MIN_CONFIDENCE } from '../../.github/scripts/experimental-auto-repair.mjs';

const eligible = (overrides = {}) => ({
  headBranch: 'experimental',
  baseRef: 'experimental',
  decision: 'candidate-for-safe-dry-run',
  issues: [{
    confidence: MIN_CONFIDENCE,
    autoApplyAllowed: true,
    recommendedStrategy: 'lockfile-fixer',
    ...overrides,
  }],
});

test('V4 allows only experimental safe-repair candidates', () => {
  assert.equal(isRepairEligible(eligible()), true);
  assert.equal(selectRepair(eligible())?.recommendedStrategy, 'lockfile-fixer');
});

test('V4 rejects repairs outside experimental', () => {
  assert.equal(isRepairEligible(eligible({})), true);
  assert.equal(isRepairEligible({ ...eligible(), headBranch: 'main' }), false);
  assert.equal(isRepairEligible({ ...eligible(), baseRef: 'main' }), true);
  assert.equal(isRepairEligible({ ...eligible(), baseRef: 'release' }), false);
});

test('V4 rejects low-confidence, auto-apply, and strategy violations', () => {
  assert.equal(isRepairEligible(eligible({ confidence: MIN_CONFIDENCE - 0.01 })), false);
  assert.equal(isRepairEligible(eligible({ autoApplyAllowed: false })), false);
  assert.equal(isRepairEligible(eligible({ recommendedStrategy: 'typescript-fixer' })), false);
});

test('V4 lockfile guard permits only package-lock.json', () => {
  assert.equal(allowedChangedPaths(['package-lock.json']), true);
  assert.equal(allowedChangedPaths(['package.json']), false);
  assert.equal(allowedChangedPaths(['package-lock.json', 'src/app.tsx']), false);
  assert.equal(allowedChangedPaths([]), false);
});
