import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRepairPlan } from './planner.mjs';
import { verifyRepairPlan } from './verifier.mjs';
import { applyChange } from './executor.mjs';

test('Playwright repair stays consistent from plan through dry-run execution', () => {
  const diagnosis = {
    knownPattern: 'playwright',
    category: 'ENVIRONMENT',
    rootCause: 'Playwright browser executable is missing from the runner.',
  };

  const plan = buildRepairPlan(diagnosis);
  assert.equal(plan.status, 'planned');
  assert.deepEqual(plan.files, ['.github/workflows/qr-independent-certification.yml']);
  assert.equal(plan.changes[0].type, 'insert-after');
  assert.equal(plan.changes[0].anchor, 'npm ci --include=dev');
  assert.equal(plan.changes[0].content, 'npx playwright install chromium');

  const verification = verifyRepairPlan(plan, { tool: 'qr' });
  assert.equal(verification.valid, true, verification.errors.join('; '));

  const result = applyChange(
    'steps:\n  - run: npm ci --include=dev\n  - run: npm run test:desktop\n',
    {
      file: '.github/workflows/qr-independent-certification.yml',
      type: 'insert-after',
      anchor: 'npm ci --include=dev',
      content: 'npx playwright install chromium\n',
    },
  );

  assert.match(result, /npm ci --include=dev/);
  assert.match(result, /npx playwright install chromium/);
  assert.match(result, /npm run test:desktop/);
});
