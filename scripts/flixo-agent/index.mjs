import { collectRepositoryContext } from './context.mjs';
import { diagnose } from './diagnose.mjs';
import { diagnosePlaywright } from './rules/playwright.mjs';

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    args.set(key, next && !next.startsWith('--') ? next : true);
    if (next && !next.startsWith('--')) i += 1;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const log = args.get('log') || process.env.FLIXO_CI_LOG || '';

const context = await collectRepositoryContext();
const baseDiagnosis = diagnose(log);
const specialized = diagnosePlaywright(log);

const diagnosis = specialized ?? baseDiagnosis;

const result = {
  agent: 'FLIXO CI Repair Agent',
  version: '0.1.0',
  mode: 'diagnose-only',
  sha: context.sha,
  diagnosis,
  context: {
    repositoryRoot: context.repositoryRoot,
    loadedFiles: Object.entries(context.files)
      .filter(([, value]) => value !== null)
      .map(([file]) => file),
  },
  execution: {
    applied: false,
    reason: 'v0.1 is diagnosis-only; mutations require a verified repair planner and executor.',
  },
};

process.stdout.write(JSON.stringify(result, null, 2) + '\n');
