import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCognitiveAssessment } from '../cognitive/cognitive-engine.mjs';
import { buildStrategicPlan, nextEligibleStep } from '../planning/strategic-planner.mjs';

test('cognitive engine ranks similar historical repairs deterministically', () => {
  const assessment = buildCognitiveAssessment({
    log: "Error: Cannot find module 'jsqr' in QR Node Matrix",
    context: {
      projectGraph: {
        nodes: [{ id: 'qr-node', tool: 'QR Generator', path: 'scripts/test-qr-payload-matrix.mjs' }],
        edges: [],
      },
    },
    decisions: [
      { id: 'd1', observedIssue: "Cannot find module 'jsqr'", selectedRemediation: 'dependency-sync', outcome: 'success' },
      { id: 'd2', observedIssue: 'chrome-headless-shell.exe missing', selectedRemediation: 'playwright install', outcome: 'success' },
    ],
  });

  assert.equal(assessment.deterministic, true);
  assert.equal(assessment.similarDecisions[0].id, 'd1');
  assert.equal(assessment.dependencyImpact.packageManifestChanged, true);
});

test('strategic planner builds a guarded dependency repair plan', () => {
  const plan = buildStrategicPlan({
    diagnosis: {
      known: true,
      knownPattern: 'jsqr',
      layer: 'DEPENDENCY',
    },
    dependencyImpact: { packageManifestChanged: true },
  });

  assert.equal(plan.status, 'planned');
  assert.equal(plan.policy.ciRequiredBetweenSteps, true);
  assert.equal(plan.policy.autoApply, false);
  assert.equal(plan.steps[0].gate, 'Node');
  assert.equal(plan.steps[0].autoApply, false);
});

test('strategic planner supports conditional multi-step execution', () => {
  const plan = buildStrategicPlan({
    diagnosis: {
      known: true,
      knownPattern: 'baseline',
      layer: 'CONTRACT',
    },
    dependencyImpact: { packageManifestChanged: true },
  });

  assert.equal(plan.steps.length >= 1, true);
  assert.equal(nextEligibleStep(plan, []).id, plan.steps[0].id);
  assert.equal(nextEligibleStep(plan, [plan.steps[0].id]), null);
});

test('unknown failures are escalated instead of guessed', () => {
  const plan = buildStrategicPlan({
    diagnosis: { known: false, knownPattern: null, layer: 'UNKNOWN' },
  });

  assert.equal(plan.status, 'manual-review');
  assert.deepEqual(plan.steps, []);
});
