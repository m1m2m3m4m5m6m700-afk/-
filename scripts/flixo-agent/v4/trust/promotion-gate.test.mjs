import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPromotion, DEVELOPMENT_BRANCH } from './promotion-gate.mjs';

test('promotion accepts only certified development branch with green CI and approval', () => {
  const result = verifyPromotion({
    sourceBranch: DEVELOPMENT_BRANCH,
    targetBranch: 'main',
    ciGreen: true,
    approved: true,
    certificationStatus: 'CERTIFIED',
  });
  assert.equal(result.valid, true);
});

test('promotion rejects missing approval or certification', () => {
  const result = verifyPromotion({
    sourceBranch: DEVELOPMENT_BRANCH,
    targetBranch: 'main',
    ciGreen: true,
    approved: false,
    certificationStatus: 'PENDING',
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /explicit approval/);
  assert.match(result.errors.join(' '), /CERTIFIED/);
});

test('promotion rejects wrong source branch', () => {
  const result = verifyPromotion({
    sourceBranch: 'main',
    targetBranch: 'main',
    ciGreen: true,
    approved: true,
    certificationStatus: 'CERTIFIED',
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /promotion source/);
});
