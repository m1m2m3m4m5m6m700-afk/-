import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import crypto from 'node:crypto';

const root = process.cwd();
const out = '.artifacts/errors/failure-memory-load.json';
const count = Number(process.env.FAILURE_MEMORY_LOAD_COUNT ?? 1200);
const entries = {};
const startWrite = performance.now();
for (let i = 0; i < count; i++) {
  const fingerprint = crypto.createHash('sha256').update(`synthetic-${i % 500}`).digest('hex').slice(0, 32);
  entries[fingerprint] = {
    fingerprint,
    occurrences: i + 1,
    rootCauseCode: i % 2 ? 'timeout' : 'network',
    diagnosisConfidence: 0.96,
    resolutionStatus: i % 3 === 0 ? 'fixed' : 'unreviewed',
    lastSeenAt: new Date().toISOString(),
  };
}
const payload = JSON.stringify({ schemaVersion: 2, maxEntries: 500, entries });
await fs.mkdir('.artifacts/errors', { recursive: true });
await fs.writeFile(`${root}/${out}`, payload);
const writeMs = performance.now() - startWrite;
const startRead = performance.now();
const loaded = JSON.parse(await fs.readFile(`${root}/${out}`, 'utf8'));
const readMs = performance.now() - startRead;
const unique = Object.keys(loaded.entries).length;
const result = { count, unique, readMs: Number(readMs.toFixed(2)), writeMs: Number(writeMs.toFixed(2)), targetMs: 100, pass: readMs < 100 && writeMs < 100 };
await fs.writeFile(`${root}/${out}`, JSON.stringify(result, null, 2));
console.log(`FAILURE MEMORY LOAD: ${JSON.stringify(result)}`);
if (!result.pass) process.exit(1);
