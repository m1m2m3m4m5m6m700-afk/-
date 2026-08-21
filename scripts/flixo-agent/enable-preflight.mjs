import { chmod } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

await chmod('.githooks/pre-commit', 0o755);
await exec('git', ['config', 'core.hooksPath', '.githooks']);
console.log('FLIXO preflight enabled: every local commit now runs scripts/flixo-agent/preflight.mjs');
