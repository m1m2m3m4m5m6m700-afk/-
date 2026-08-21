import test from 'node:test';
import assert from 'node:assert/strict';
import { readLog } from '../core/log-reader.mjs';

test('extracts TS2322 and source location from a real-style log', () => {
  const log = `error TS2322: Type 'Uint8Array' is not assignable to type 'ArrayBuffer'.\n at src/features/PdfMerge.tsx:104:17`;
  const result = readLog(log);
  assert.equal(result.errorType, 'TYPECHECK');
  assert.match(result.errorMessage, /TS2322/);
  assert.equal(result.affectedFile, 'src/features/PdfMerge.tsx');
  assert.equal(result.line, 104);
});

test('does not guess unknown logs', () => {
  const result = readLog('runner completed with an unusual opaque condition');
  assert.equal(result.errorType, 'UNKNOWN');
  assert.equal(result.affectedFile, null);
});
