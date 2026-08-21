import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRootCause } from '../core/root-cause-analyzer.mjs';
import { buildDebugReport } from '../core/contextual-debugger.mjs';

test('root cause maps TS2322 to typecheck with high confidence', () => {
  const rootCause = analyzeRootCause({ errorType: 'TYPECHECK', errorMessage: 'TS2322', affectedFile: 'src/features/PdfMerge.tsx', log: 'TS2322 src/features/PdfMerge.tsx:104' });
  assert.equal(rootCause.deterministic, true);
  assert.equal(rootCause.escalationRequired, false);
  assert.ok(rootCause.confidence >= 0.85);
  assert.deepEqual(rootCause.affectedFiles, ['src/features/PdfMerge.tsx']);
});

test('contextual debugger never grants repair authority', () => {
  const report = buildDebugReport({
    signature: { signature: 'TYPECHECK-PdfMerge.tsx-demo' },
    parsed: { errorType: 'TYPECHECK', errorMessage: 'TS2322', affectedFile: 'src/features/PdfMerge.tsx', line: 104 },
    rootCause: { confidence: 0.92, affectedFiles: ['src/features/PdfMerge.tsx'] },
  });
  assert.equal(report.policy.readOnly, true);
  assert.equal(report.policy.autoApplyAllowed, false);
  assert.equal(report.confidence, 92);
});
