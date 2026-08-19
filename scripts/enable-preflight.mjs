import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const root = process.cwd();
const hookPath = '.githooks';

if (!fs.existsSync('.git')) {
  console.log('Preflight hooks: skipped outside a Git worktree.');
  process.exit(0);
}

fs.mkdirSync(hookPath, { recursive: true });
execFileSync('git', ['config', 'core.hooksPath', hookPath], { stdio: 'inherit' });
console.log(`Preflight hooks enabled at ${root}/${hookPath}`);
