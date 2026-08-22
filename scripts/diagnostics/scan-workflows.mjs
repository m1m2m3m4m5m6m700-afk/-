import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = '.github/workflows';
const files = (await readdir(root)).filter((name) => /\.(yml|yaml)$/.test(name));
const failures = [];
const runPattern = /^\s*-?\s*run:\s+([^#\n]+)$/gm;

for (const file of files) {
  const content = await readFile(join(root, file), 'utf8');
  for (const match of content.matchAll(runPattern)) {
    const value = match[1].trim();
    if (/:\s/.test(value) && !/^['"`]/.test(value)) {
      failures.push(`${file}:run-value-contains-colon-space-without-quoting`);
    }
  }
  if (/workflow_dispatch:/.test(content) && !/on:\s*[\s\S]*workflow_dispatch:/.test(content)) {
    failures.push(`${file}:workflow_dispatch-declaration-unreachable`);
  }
}

if (failures.length) {
  console.error(`WORKFLOW_DIAGNOSTIC_FAIL ${failures.join('; ')}`);
  process.exit(1);
}

console.log(`WORKFLOW_AUDIT files=${files.length} status=PASS`);
