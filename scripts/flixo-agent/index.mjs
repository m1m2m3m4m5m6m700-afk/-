import { collectRepositoryContext } from './context.mjs';
import { diagnose } from './diagnose.mjs';
import { diagnosePlaywright } from './rules/playwright.mjs';
import buildRepairPlan from './planner.mjs';
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
const dryRun = args.get('apply') !== true;

const context = await collectRepositoryContext();
const baseDiagnosis = diagnose(log);
const specialized = diagnosePlaywright(log);
const diagnosis = specialized ?? baseDiagnosis;
const plan = buildRepairPlan(diagnosis);
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

if (mode === 'diagnose') {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(verification.valid ? 0 : 2);
}

if (mode === 'plan') {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(verification.valid ? 0 : 2);
}

if (mode !== 'repair') {
  throw new Error(`Unsupported mode: ${mode}. Use diagnose, plan, or repair.`);
}

if (!verification.valid) {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(2);
}

if (!repo || !prNumber) {
  throw new Error('Repair mode requires --repo owner/name and --pr number');
}

const adapter = createGitHubAdapter({ repository: repo, prNumber });
const pr = await adapter.getPRInfo();

if (pr.head.ref === 'main' || pr.head.ref === 'master') {
  throw new Error(`Repair mode refuses to write to protected branch ${pr.head.ref}`);
}

const local = await applyRepairPlan(plan, { dryRun: true });
const execution = {
  ...local,
  github: dryRun ? 'not called (dry-run)' : 'commit-ready',
};

if (!dryRun) {
  const materialized = await Promise.all(
    plan.changes.map(async (change) => {
      const current = await adapter.getFileContent(change.file, pr.head.ref);
      const currentResult = await applyRepairPlan({
        approved: true,
        changes: [change],
      }, { rootDir: process.cwd(), dryRun: true }).catch(() => null);

      if (!currentResult) {
        throw new Error(`Could not materialize change safely for ${change.file}`);
      }

      // Local content is the execution source of truth; adapter only commits verified bytes.
      return { path: change.file, content: current.content };
    }),
  );

  execution.githubCommit = await adapter.createCommit({
    branch: pr.head.ref,
    expectedHeadSha: pr.head.sha,
    message: plan.commitMessage || `fix(agent): repair ${diagnosis.knownPattern || diagnosis.category}`,
    changes: materialized,
  });
}

result.execution = execution;
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
