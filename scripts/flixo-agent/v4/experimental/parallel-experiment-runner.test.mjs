import assert from 'node:assert/strict';
import test from 'node:test';
import { runParallelExperiments, validateParallelExperiments } from './parallel-experiment-runner.mjs';

const qr = { experimentId: 'qr-1', tool: 'qr-generator', changes: [{ file: '.github/workflows/qr-independent-certification.yml' }] };
const pdf = { experimentId: 'pdf-1', tool: 'pdf-merge', changes: [{ file: 'tests/pdf-merge.spec.ts' }] };

test('parallel validation allows isolated tools', () => {
  const result = validateParallelExperiments([qr, pdf], { maxConcurrency: 2 });
  assert.equal(result.valid, true);
});

test('parallel validation rejects overlapping file writes', () => {
  const overlapping = { ...pdf, experimentId: 'pdf-2', changes: [{ file: '.github/workflows/qr-independent-certification.yml' }] };
  const result = validateParallelExperiments([qr, overlapping]);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /conflicting experiments/);
});

test('runner executes isolated tools in parallel and accepts successful result', async () => {
  const seen = [];
  const result = await runParallelExperiments([qr, pdf], {
    async run(experiment) {
      seen.push(experiment.tool);
      return { status: 'accepted' };
    },
  }, { maxConcurrency: 2 });
  assert.equal(result.status, 'accepted');
  assert.equal(result.acceptedExperimentId !== null, true);
  assert.deepEqual(new Set(seen), new Set(['qr-generator', 'pdf-merge']));
});

test('runner reports all-failed without accepting a failed experiment', async () => {
  const result = await runParallelExperiments([qr, pdf], {
    async run() { return { status: 'rolled-back', conclusion: 'failure' }; },
  }, { maxConcurrency: 2 });
  assert.equal(result.status, 'all-failed');
  assert.equal(result.acceptedExperimentId, null);
});
