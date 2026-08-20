import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('scripts/error-intelligence/schemas');

test('schemas are valid JSON and declare required contracts', () => {
  const files = ['error-signature.schema.json', 'root-cause.schema.json', 'debug-report.schema.json'];
  for (const file of files) {
    const schema = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    assert.equal(schema.type, 'object');
    assert.ok(Array.isArray(schema.required));
    assert.ok(schema.required.length > 0);
  }
});
