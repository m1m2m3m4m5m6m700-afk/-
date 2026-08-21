import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const SNAPSHOT_FILES = [
  'package.json',
  'package-lock.json',
  '.github/workflows/qr-independent-certification.yml',
];

function assertLocalOnly() {
  if (process.env.GITHUB_ACTIONS === 'true') {
    throw new Error('local-repair-runner cannot execute inside GitHub Actions');
  }
  if (process.env.GITHUB_TOKEN || process.env.V4_ALLOW_PUSH === 'true') {
    throw new Error('local-repair-runner refuses remote write credentials');
  }
}

export function createLocalRepairRunner() {
  const snapshot = new Map();
  let active = false;

  return {
    async createSandbox() {
      assertLocalOnly();
      if (!active) {
        active = true;
        for (const file of SNAPSHOT_FILES) {
          try {
            snapshot.set(file, await fs.readFile(file, 'utf8'));
          } catch (error) {
            if (error.code !== 'ENOENT') throw error;
          }
        }
      }
      return { kind: 'local-transaction' };
    },

    async applyStep(_sandbox, step) {
      assertLocalOnly();
      if (step.rootCause === 'jsqr') {
        const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
        if (!pkg.devDependencies?.jsqr) {
          await exec('npm', ['install', '--save-dev', 'jsqr@1.4.0'], { maxBuffer: 8 * 1024 * 1024 });
        }
        return;
      }

      if (step.rootCause === 'playwright') {
        const file = '.github/workflows/qr-independent-certification.yml';
        const text = await fs.readFile(file, 'utf8');
        if (text.includes('npx playwright install chromium')) return;
        const anchor = 'npm ci --include=dev';
        if (text.split(anchor).length - 1 !== 1) {
          throw new Error(`unsafe playwright workflow anchor: ${file}`);
        }
        const next = text.replace(
          anchor,
          `${anchor}\n    - name: Install Playwright Chromium\n      run: npx playwright install chromium`,
        );
        await fs.writeFile(file, next, 'utf8');
        return;
      }

      throw new Error(`local repair is not implemented for ${step.rootCause}`);
    },

    async runCI(_sandbox, step) {
      assertLocalOnly();
      if (step.rootCause === 'jsqr') {
        const result = await exec('npm', ['ci', '--include=dev'], { maxBuffer: 16 * 1024 * 1024 });
        return { conclusion: 'success', command: 'npm ci --include=dev', stdout: result.stdout };
      }
      if (step.rootCause === 'playwright') {
        const result = await exec('node', ['-e', "const fs=require('fs'); const y=fs.readFileSync('.github/workflows/qr-independent-certification.yml','utf8'); if(!y.includes('npx playwright install chromium')) process.exit(1)"]);
        return { conclusion: 'success', command: 'workflow-static-validation', stdout: result.stdout };
      }
      return { conclusion: 'failure', reason: `unsupported local verification for ${step.rootCause}` };
    },

    async accept() {
      assertLocalOnly();
      return { accepted: true };
    },

    async rollback() {
      assertLocalOnly();
      for (const [file, content] of snapshot.entries()) {
        await fs.writeFile(file, content, 'utf8');
      }
      for (const file of SNAPSHOT_FILES) {
        if (!snapshot.has(file)) {
          try { await fs.rm(file, { force: true }); } catch {}
        }
      }
      return { rolledBack: true };
    },
  };
}
