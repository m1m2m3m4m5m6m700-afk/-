import assert from 'node:assert/strict';
import test from 'node:test';
import { diagnose } from '../diagnose.mjs';
import { buildCognitiveAssessment } from '../cognitive/cognitive-engine.mjs';
import { buildStrategicPlan } from '../planning/strategic-planner.mjs';

test('diagnose identifies lockfile failures deterministically', () => {
  const result = diagnose('npm ci failed: package-lock.json is out of sync with package.json');
  assert.equal(result.known, true);
  assert.equal(result.knownPattern, 'lockfile');
  assert.equal(result.layer, 'DEPENDENCY');
});

test('cognitive engine preserves deterministic diagnosis and historical ranking', () => {
  const assessment = buildCognitiveAssessment({
    log: "npm ERR! ERESOLVE package-lock.json mismatch in jsqr QR Node Matrix",
    context: { projectGraph: { nodes: [{ id: 'qr', tool: 'QR Generator', path: 'scripts/test-qr.mjs' }], edges: [] } },
    decisions: [
      { id: 'lock-1', observedIssue: 'package-lock.json mismatch', selectedRemediation: 'dependency-sync', outcome: 'success' },
      { id: 'pw-1', observedIssue: 'chrome-headless-shell missing', selectedRemediation: 'browser-install', outcome: 'success' },
    ],
  });
  assert.equal(assessment.deterministic, true);
  assert.equal(assessment.diagnosis.known, true);
  assert.equal(assessment.similarDecisions[0].id, 'lock-1');
  assert.equal(assessment.dependencyImpact.packageManifestChanged, true);
});

test('strategic planner makes lockfile repair the first guarded step', () => {
  const plan = buildStrategicPlan({
    diagnosis: { known: true, knownPattern: 'lockfile', layer: 'DEPENDENCY' },
    dependencyImpact: { packageManifestChanged: true },
  });
  assert.equal(plan.status, 'planned');
  assert.equal(plan.steps[0].id, 'dependency-repair');
  assert.equal(plan.policy.autoApply, false);
  assert.equal(plan.policy.ciRequiredBetweenSteps, true);
});

test('unknown failures are escalated instead of guessed', () => {
  const plan = buildStrategicPlan({ diagnosis: { known: false, knownPattern: null, layer: 'UNKNOWN' } });
  assert.equal(plan.status, 'manual-review');
  assert.deepEqual(plan.steps, []);
});
