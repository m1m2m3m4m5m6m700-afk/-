import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSignature } from '../core/signature-generator.mjs';

test('signature is stable across run-specific numbers and paths', () => {
  const a = generateSignature({ errorType: 'TYPECHECK', errorMessage: "TS2322 at /home/runner/work/foo.ts:104", affectedFile: 'src/PdfMerge.tsx' });
  const b = generateSignature({ errorType: 'TYPECHECK', errorMessage: "TS2322 at /home/runner/work/bar.ts:998", affectedFile: 'src/PdfMerge.tsx' });
  assert.equal(a.signature, b.signature);
});
