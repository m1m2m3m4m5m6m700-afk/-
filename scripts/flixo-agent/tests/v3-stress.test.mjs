import assert from 'node:assert/strict';
import test from 'node:test';

import { diagnose, knownPatterns } from '../diagnose.mjs';
import { buildCognitiveAssessment } from '../cognitive/cognitive-engine.mjs';
import { buildStrategicPlan, nextEligibleStep } from '../planning/strategic-planner.mjs';

const cases = [
  ['typescript', 'error TS2322: Type Uint8Array<ArrayBufferLike> is not assignable to type BlobPart'],
  ['typescript', 'npm run typecheck failed with error TS7006 in src/example.ts'],
  ['lockfile', 'npm ci failed: package-lock.json is out of sync with package.json'],
  ['lockfile', 'npm ERR! ERESOLVE unable to resolve dependency tree'],
  ['playwright', 'Error: browser executable is missing for Playwright'],
  ['playwright', 'Timeout 30000ms exceeded while waiting for page.locator'],
  ['baseline', 'baseline.certifiedCommit validation failed'],
  ['workflow', 'GitHub Actions workflow failed to parse .github/workflows/ci.yml'],
  ['lint', 'eslint found 2 errors'],
  ['build', 'vite build failed with RollupError'],
];

for (const [pattern, log] of cases) {
  test(`stress diagnosis: ${pattern}`, () => {
    const result = diagnose(log);
    assert.equal(result.known, true);
    assert.equal(result.knownPattern, pattern);
    assert.ok(result.confidence >= 0.9);
  });
}

test('known pattern catalog contains all guarded roots', () => {
  const ids = new Set(knownPatterns().map((entry) => entry.id));
  for (const expected of ['typescript', 'lockfile', 'playwright', 'baseline', 'lint', 'build', 'workflow', 'arabic', 'jsqr']) {
    assert.equal(ids.has(expected), true);
  }
});

test('typecheck outranks incidental localization wording', () => {
  const log = [
    'src/components/tools/PdfMerge.tsx:104',
    'error TS2322: Type Uint8Array<ArrayBufferLike> is not assignable to type BlobPart',
    'i18n localization check completed successfully',
    'locale ar-EG present',
  ].join('\n');
  const result = diagnose(log);
  assert.equal(result.knownPattern, 'typescript');
  assert.equal(result.layer, 'TYPECHECK');
});

test('precedence matrix handles only incidental noise for each root', () => {
  const noiseByPattern = {
    typescript: ['i18n locale ar-EG', 'npm test', 'warning: unrelated message'],
    lockfile: ['i18n locale ar-EG', 'npm test', 'warning: unrelated message', 'Cannot find module jsqr'],
    playwright: ['i18n locale ar-EG', 'npm test', 'warning: unrelated message'],
    baseline: ['i18n locale ar-EG', 'npm test', 'warning: unrelated message'],
    workflow: ['i18n locale ar-EG', 'npm test', 'warning: unrelated message'],
    lint: ['i18n locale ar-EG', 'npm test', 'warning: unrelated message'],
    build: ['i18n locale ar-EG', 'npm test', 'warning: unrelated message'],
  };

  for (const [pattern, cleanLog] of cases) {
    const result = diagnose([cleanLog, ...(noiseByPattern[pattern] ?? [])].join('\n'));
    assert.equal(result.knownPattern, pattern, pattern);
  }
});

test('explicit precedence rules survive conflicting signals', () => {
  const typecheckVsLockfile = diagnose('error TS2322 in PdfMerge.tsx\npackage-lock.json is unchanged\ni18n locale ar-EG\nGitHub workflow succeeded');
  assert.equal(typecheckVsLockfile.knownPattern, 'typescript');

  const lockfileVsJsqr = diagnose('npm ERR! ERESOLVE package-lock.json mismatch\nCannot find module jsqr\nworkflow succeeded');
  assert.equal(lockfileVsJsqr.knownPattern, 'lockfile');

  const workflowVsArabic = diagnose('GitHub Actions workflow failed to parse .github/workflows/ci.yml\ni18n locale ar-EG');
  assert.equal(workflowVsArabic.knownPattern, 'workflow');
});

test('multi-signal assessment remains deterministic', () => {
  const log = [
    'error TS2322 in PdfMerge.tsx',
    'package-lock.json is unchanged',
    'workflow validation succeeded',
  ].join('\n');
  const assessment = buildCognitiveAssessment({
    log,
    context: {
      projectGraph: {
        nodes: [
          { id: 'pdf-merge', name: 'PdfMerge', path: 'src/components/tools/PdfMerge.tsx' },
          { id: 'workflow', name: 'CI', path: '.github/workflows/ci.yml' },
        ],
        edges: [],
      },
    },
    decisions: [],
  });
  assert.equal(assessment.deterministic, true);
  assert.equal(assessment.diagnosis.knownPattern, 'typescript');
  assert.equal(assessment.dependencyImpact.workflowChanged, true);
  assert.equal(assessment.affectedNodes.length >= 1, true);
});

test('unknown noise is escalated instead of guessed', () => {
  const assessment = buildCognitiveAssessment({ log: 'runner emitted an unrelated transient message' });
  assert.equal(assessment.diagnosis.known, false);
  const plan = buildStrategicPlan(assessment);
  assert.equal(plan.status, 'manual-review');
  assert.deepEqual(plan.steps, []);
});

test('lockfile diagnosis produces guarded dependency plan', () => {
  const plan = buildStrategicPlan({
    diagnosis: { known: true, knownPattern: 'lockfile', layer: 'DEPENDENCY' },
    dependencyImpact: { packageManifestChanged: true },
  });
  assert.equal(plan.status, 'planned');
  assert.equal(plan.steps[0].id, 'dependency-repair');
  assert.equal(plan.steps[0].autoApply, false);
  assert.equal(plan.policy.ciRequiredBetweenSteps, true);
});

test('playwright diagnosis never becomes automatic application', () => {
  const plan = buildStrategicPlan({
    diagnosis: { known: true, knownPattern: 'playwright', layer: 'WORKFLOW' },
  });
  assert.equal(plan.status, 'planned');
  assert.equal(plan.steps[0].id, 'browser-environment-repair');
  assert.equal(plan.steps[0].autoApply, false);
});

test('workflow-only failures escalate through a bounded review plan', () => {
  const plan = buildStrategicPlan({
    diagnosis: { known: true, knownPattern: 'workflow', layer: 'WORKFLOW' },
  });
  assert.equal(plan.status, 'planned');
  assert.equal(plan.steps.length, 1);
  assert.equal(plan.steps[0].id, 'workflow-boundary-review');
  assert.equal(plan.steps[0].autoApply, false);
});

test('next eligible step respects dependencies', () => {
  const plan = buildStrategicPlan({
    diagnosis: { known: true, knownPattern: 'lockfile', layer: 'DEPENDENCY' },
    dependencyImpact: { packageManifestChanged: true },
  });
  assert.equal(nextEligibleStep(plan, []).id, 'dependency-repair');
  assert.equal(nextEligibleStep(plan, ['dependency-repair']), null);
  assert.equal(nextEligibleStep(plan, [], ['dependency-repair']), null);
});

test('auto-apply is never enabled by default in any stress plan', () => {
  for (const pattern of ['lockfile', 'playwright', 'baseline', 'typescript']) {
    const layer = pattern === 'baseline' ? 'CONTRACT' : pattern === 'lockfile' ? 'DEPENDENCY' : pattern === 'playwright' ? 'WORKFLOW' : 'TYPECHECK';
    const plan = buildStrategicPlan({
      diagnosis: { known: true, knownPattern: pattern, layer },
      dependencyImpact: { packageManifestChanged: pattern === 'lockfile' },
    });
    assert.equal(plan.policy.autoApply, false);
    for (const step of plan.steps) assert.equal(step.autoApply, false);
  }
});

test('deterministic classification remains stable under 10000 repeated evaluations', () => {
  const log = 'error TS2322 in PdfMerge.tsx with i18n metadata and workflow notes';
  const expected = JSON.stringify(diagnose(log));
  for (let i = 0; i < 10_000; i += 1) {
    assert.equal(JSON.stringify(diagnose(log)), expected);
  }
});
