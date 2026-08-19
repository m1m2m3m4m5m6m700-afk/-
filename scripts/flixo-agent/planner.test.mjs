import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRepairPlan } from './planner.mjs';
import { verifyRepairPlan } from './verifier.mjs';

test('planner creates a constrained Playwright plan', () => {
  const plan = buildRepairPlan({
    knownPattern: 'playwright',
    category: 'ENVIRONMENT',
  });

  assert.equal(plan.status, 'planned');
  assert.deepEqual(plan.files, ['.github/workflows/qr-independent-certification.yml']);
  assert.equal(plan.changes[0].anchor, 'npm ci --include=dev');
  assert.equal(plan.constraints.requireCiProof, true);
});

test('verifier accepts the Playwright plan in QR scope', () => {
  const plan = buildRepairPlan({ knownPattern: 'playwright', category: 'ENVIRONMENT' });
  const result = verifyRepairPlan(plan, { tool: 'qr' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('verifier rejects package manifest without lockfile', () => {
  const plan = {
    version: 1,
    status: 'planned',
    category: 'DEPENDENCY',
    files: ['package.json'],
    changes: [{ type: 'dependency-sync', package: 'jsqr', version: '^1.4.0', command: 'npm install --save-dev jsqr@^1.4.0' }],
    validation: [],
  };

  const result = verifyRepairPlan(plan, { tool: 'qr' });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /package\.json and package-lock\.json/);
});

test('verifier rejects release workflow changes', () => {
  const plan = buildRepairPlan({ knownPattern: 'playwright', category: 'ENVIRONMENT' });
  plan.files.push('.github/workflows/release-certification.yml');
  const result = verifyRepairPlan(plan, { tool: 'qr' });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /protected file/);
});

test('verifier rejects cross-tool workflow edits', () => {
  const plan = buildRepairPlan({ knownPattern: 'playwright', category: 'ENVIRONMENT' });
  plan.files = ['.github/workflows/pdf-merge-independent-certification.yml'];
  const result = verifyRepairPlan(plan, { tool: 'qr' });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /workflow isolation violation/);
});
