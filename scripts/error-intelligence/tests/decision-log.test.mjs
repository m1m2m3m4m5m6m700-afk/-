import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { appendErrorDecision, readErrorHistory } from '../core/decision-log.mjs';
import { summarizeTrends } from '../core/trend-dashboard.mjs';

test('decision log persists and dashboard summarizes error history', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flixo-error-intelligence-'));
  const file = path.join(dir, 'errors.jsonl');
  appendErrorDecision({ signature: 'TYPECHECK-PdfMerge-demo', parsed: { errorType: 'TYPECHECK' }, rootCause: { affectedFiles: ['src/PdfMerge.tsx'] }, repairDurationMs: 1200 }, file);
  appendErrorDecision({ signature: 'TYPECHECK-PdfMerge-demo', parsed: { errorType: 'TYPECHECK' }, rootCause: { affectedFiles: ['src/PdfMerge.tsx'] }, repairDurationMs: 800 }, file);
  const history = readErrorHistory(file);
  const summary = summarizeTrends(history);
  assert.equal(history.length, 2);
  assert.deepEqual(summary.topErrorTypes[0], ['TYPECHECK', 2]);
  assert.deepEqual(summary.topAffectedFiles[0], ['src/PdfMerge.tsx', 2]);
  assert.equal(summary.meanRepairDurationMs, 1000);
});
