import process from "node:process";

const sha = process.env.GITHUB_SHA;
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;

if (!sha || !token || !repository) {
  console.error("RELEASE CERTIFICATION: FAIL");
  console.error("Missing GITHUB_SHA, GITHUB_TOKEN, or GITHUB_REPOSITORY.");
  process.exit(1);
}

const [owner, repo] = repository.split("/");
const api = async (path) => {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "flixo-release-certification",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  return response.json();
};

const workflows = [
  { id: "verification-matrix", name: "Verification Matrix" },
  { id: "tool-platform", name: "Tool Platform" },
];

const workflowList = await api(`/repos/${owner}/${repo}/actions/workflows`);
const resolved = workflows.map((workflow) => {
  const match = workflowList.workflows.find((candidate) => candidate.name === workflow.name);
  if (!match) throw new Error(`Workflow not found: ${workflow.name}`);
  return { ...workflow, workflowId: match.id };
});

const failures = [];
const evidence = [];

for (const workflow of resolved) {
  const runs = await api(
    `/repos/${owner}/${repo}/actions/workflows/${workflow.workflowId}/runs?per_page=20&branch=develop`
  );
  const matching = runs.workflow_runs
    .filter((run) => run.head_sha === sha && run.status === "completed")
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  const latestTwo = matching.slice(0, 2);
  if (latestTwo.length < 2) {
    failures.push(`${workflow.name}: requires 2 completed successful runs on ${sha}, found ${latestTwo.length}.`);
    evidence.push({ workflow: workflow.name, sha, runs: latestTwo.map((run) => ({ id: run.id, conclusion: run.conclusion })) });
    continue;
  }

  if (latestTwo.some((run) => run.conclusion !== "success")) {
    failures.push(`${workflow.name}: latest two completed runs on ${sha} are not both successful.`);
  }

  evidence.push({
    workflow: workflow.name,
    sha,
    runs: latestTwo.map((run) => ({ id: run.id, conclusion: run.conclusion, completedAt: run.completed_at })),
  });
}

if (failures.length) {
  console.error("RELEASE CERTIFICATION: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
}

console.log("RELEASE CERTIFICATION: PASS");
console.log(JSON.stringify(evidence, null, 2));
