import { chmod, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

async function main() {
  if (!(await access('.git').then(() => true).catch(() => false))) return;
  try {
    await chmod('.githooks/pre-commit', 0o755);
    await exec('git', ['config', 'core.hooksPath', '.githooks']);
    console.log('FLIXO preflight hook installed.');
  } catch (error) {
    console.warn(`FLIXO preflight hook installation skipped: ${error.message}`);
  }
}

await main();
