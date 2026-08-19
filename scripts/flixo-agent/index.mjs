import { collectRepositoryContext } from './context.mjs';
import { diagnose } from './diagnose.mjs';
import { diagnosePlaywright } from './rules/playwright.mjs';
import { planRepair } from './planner.mjs';
import { verifyRepairPlan } from './verifier.mjs';
import { applyRepairPlan } from './executor.mjs';
import { createGitHubAdapter } from './github.mjs';

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
const mode = args.get('mode') || 'diagnose';
const repo = args.get('repo') || process.env.GITHUB_REPOSITORY || '';
const prNumber = Number(args.get('pr') || process.env.FLIXO_PR_NUMBER || 0);
const explicitApply = args.get('apply') === true;
const dryRun = !explicitApply;

const context = await collectRepositoryContext();
const baseDiagnosis = diagnose(log);
const specialized = diagnosePlaywright(log);
const diagnosis = specialized ?? baseDiagnosis;

const plan = await planRepair(diagnosis, context);
const verification = verifyRepairPlan(plan, context);

const result = {
  agent: 'FLIXO CI Repair Agent',
  version: '0.1.0',
  mode,
  dryRun,
  sha: context.sha,
  diagnosis,
  plan,
  verification,
};

if (mode === 'diagnose' || mode === 'plan' || !verification.approved) {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(verification.approved ? 0 : 2);
}

if (mode !== 'repair') {
  throw new Error(`Unsupported mode: ${mode}. Use diagnose, plan, or repair.`);
}

if (!repo || !prNumber) {
  throw new Error('Repair mode requires --repo owner/name and --pr number');
}

const adapter = createGitHubAdapter({ repository: repo, prNumber });
const pr = await adapter.getPRInfo();

if (!dryRun && pr.head.ref === 'main') {
  throw new Error('Repair mode refuses to write to main');
}

const localExecution = await applyRepairPlan(plan, { dryRun: true });

result.execution = {
  ...localExecution,
  github: dryRun ? 'not called (dry-run)' : 'ready for verified commit',
};

if (!dryRun) {
  const changes = localExecution.files.map((file) => ({
    path: file,
    content: plan.changes.find((change) => change.file === file)?.content ?? '',
  }));
  // The executor remains file-safe; GitHub writes are enabled only after a verified plan.
  // A future dependency-aware executor step should supply fully materialized file contents here.
  result.execution.githubCommit = await adapter.createCommit({
    branch: pr.head.ref,
    expectedHeadSha: pr.head.sha,
    message: plan.commitMessage || `fix(agent): automated repair for ${diagnosis.code || diagnosis.category}`,
    changes,
  });
}

process.stdout.write(JSON.stringify(result, null, 2) + '\n');
