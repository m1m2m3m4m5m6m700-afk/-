import test from 'node:test';
import assert from 'node:assert/strict';
import { assertSafeAgentPath, assertSafeBranchForPR } from './github.mjs';

test('rejects protected branches', () => {
  assert.throws(() => assertSafeBranchForPR('main'), /protected\/default branch/);
  assert.throws(() => assertSafeBranchForPR('master'), /protected\/default branch/);
});

test('requires PR head branch when supplied', () => {
  assert.doesNotThrow(() => assertSafeBranchForPR('feature/example', 'feature/example'));
  assert.throws(() => assertSafeBranchForPR('feature/other', 'feature/example'), /Branch mismatch/);
});

test('rejects unsafe or protected repository paths', () => {
  assert.throws(() => assertSafeAgentPath('../package.json'), /Unsafe repository path/);
  assert.throws(() => assertSafeAgentPath('/etc/passwd'), /Unsafe repository path/);
  assert.throws(
    () => assertSafeAgentPath('.github/workflows/release-certification.yml'),
    /outside the agent write scope/,
  );
  assert.doesNotThrow(() => assertSafeAgentPath('.github/workflows/qr-independent-certification.yml'));
});
