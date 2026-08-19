const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const headSha = process.env.HEAD_SHA;
const headBranch = process.env.HEAD_BRANCH;
const baseBranch = process.env.BASE_BRANCH;

if (!token || !repository || !headSha || !headBranch || !baseBranch) {
  console.error('PROMOTION GATE: FAIL');
  console.error('Missing promotion gate environment variables.');
  process.exit(1);
}

if (baseBranch !== 'main') {
  console.log(`PROMOTION GATE: SKIP (base=${baseBranch})`);
  process.exit(0);
}

if (headBranch !== 'experimental') {
  console.error(`PROMOTION GATE: FAIL (source branch must be experimental; got ${headBranch})`);
  process.exit(1);
}

const api = async (path, options = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'flixo-promotion-gate',
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  return response.json();
};

const [owner, repo] = repository.split('/');

async function workflowIdByName(name) {
  const result = await api(`/repos/${owner}/${repo}/actions/workflows?per_page=100`);
  const workflow = result.workflows.find((item) => item.name === name);
  if (!workflow) throw new Error(`Required workflow not found: ${name}`);
  return workflow.id;
}

async function successfulRun(workflowId, workflowName) {
  const result = await api(
    `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?head_sha=${encodeURIComponent(headSha)}&per_page=20`,
  );
  const matches = result.workflow_runs
    .filter((run) => run.head_sha === headSha && run.head_branch === headBranch)
    .filter((run) => run.status === 'completed' && run.conclusion === 'success')
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  if (!matches.length) {
    throw new Error(`${workflowName}: no successful completed run exists for ${headSha}.`);
  }

  return {
    id: matches[0].id,
    runNumber: matches[0].run_number,
    completedAt: matches[0].completed_at,
    event: matches[0].event,
  };
}

async function verifyMainProtection() {
  try {
    const protection = await api(`/repos/${owner}/${repo}/branches/main/protection`);
    const required = protection.required_status_checks;
    const reviews = protection.required_pull_request_reviews;
    const admins = protection.enforce_admins;
    const hasRequiredChecks = Boolean(required && ((required.contexts ?? []).length || (required.checks ?? []).length));
    const hasPullRequestReview = Boolean(reviews && typeof reviews === 'object');
    const adminsEnforced = Boolean(admins?.enabled);

    if (!hasRequiredChecks) {
      throw new Error('main protection is enabled but has no required status checks.');
    }
    if (!hasPullRequestReview) {
      throw new Error('main protection is enabled but pull-request review protection is missing.');
    }
    if (!adminsEnforced) {
      throw new Error('main protection is enabled but administrator enforcement is disabled.');
    }

    return {
      enabled: true,
      requiredContexts: required.contexts ?? [],
      requiredChecks: required.checks ?? [],
      pullRequestReviewsEnabled: true,
      administratorsEnforced: true,
    };
  } catch (error) {
    throw new Error(`main protection is not production-safe: ${error.message}`);
  }
}

const workflowNames = [
  'CI',
  'Development AI Guardian',
  'FLIXO Project Diagnosis',
];

try {
  const evidence = {};
  for (const workflowName of workflowNames) {
    const workflowId = await workflowIdByName(workflowName);
    evidence[workflowName] = await successfulRun(workflowId, workflowName);
  }

  const protection = await verifyMainProtection();

  const report = {
    version: 1,
    status: 'CERTIFIED',
    headSha,
    headBranch,
    baseBranch,
    generatedAt: new Date().toISOString(),
    evidence,
    mainProtection: protection,
    autoMergeEligible: true,
  };

  console.log('CERTIFICATION: PASS');
  console.log('PROMOTION GATE: PASS');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error('CERTIFICATION: FAIL');
  console.error('PROMOTION GATE: FAIL');
  console.error(error.message);
  process.exit(1);
}
