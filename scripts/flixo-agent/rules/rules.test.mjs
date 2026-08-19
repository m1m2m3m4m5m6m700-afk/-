import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnose } from '../diagnose.mjs';

const playwrightLog = "Error: browserType.launch: Executable doesn't exist at C:\\Users\\runneradmin\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell.exe";
const jsqrLog = 'Error: Cannot find module \'jsqr\'';
const baselineLog = 'certification commit mismatch';

test('diagnose exposes planner-compatible playwright pattern', () => {
  const result = diagnose(playwrightLog);
  assert.equal(result.known, true);
  assert.equal(result.knownPattern, 'playwright');
  assert.equal(result.ruleId, 'playwright-missing-browser');
  assert.equal(result.layer, 'ENVIRONMENT');
});

test('diagnose exposes planner-compatible jsqr pattern', () => {
  const result = diagnose(jsqrLog);
  assert.equal(result.known, true);
  assert.equal(result.knownPattern, 'jsqr');
  assert.equal(result.ruleId, 'missing-jsqr');
  assert.equal(result.layer, 'DEPENDENCY');
});

test('diagnose exposes planner-compatible baseline pattern', () => {
  const result = diagnose(baselineLog);
  assert.equal(result.known, true);
  assert.equal(result.knownPattern, 'baseline');
  assert.equal(result.ruleId, 'baseline-commit-path');
  assert.equal(result.layer, 'CONTRACT');
});

test('unknown failures remain manual-review compatible', () => {
  const result = diagnose('Unexpected unknown CI failure');
  assert.equal(result.known, false);
  assert.equal(result.knownPattern, null);
});
