import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function command(commandName, args = []) {
  try {
    return execFileSync(commandName, args, { encoding: 'utf8' }).trim();
  } catch {
    return 'unavailable';
  }
}

const report = {
  node: process.version,
  npm: command('npm', ['--version']),
  git: command('git', ['--version']),
  commit: command('git', ['rev-parse', 'HEAD']),
  branch: command('git', ['branch', '--show-current']),
  status: command('git', ['status', '--short']),
  platform: process.platform,
  arch: process.arch,
  ci: process.env.CI === 'true',
  vercel: Boolean(process.env.VERCEL),
};

await mkdir(resolve('artifacts/diagnostics'), { recursive: true });
await writeFile(resolve('artifacts/diagnostics/environment.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`ENVIRONMENT node=${report.node} npm=${report.npm} commit=${report.commit} branch=${report.branch || '<detached>'}`);
