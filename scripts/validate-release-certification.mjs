import fs from "node:fs";
import process from "node:process";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const eventPath = process.env.GITHUB_EVENT_PATH;

if (!token || !repository || !eventPath) {
  console.error("RELEASE CERTIFICATION: FAIL");
  console.error("Missing GITHUB_TOKEN, GITHUB_REPOSITORY, or GITHUB_EVENT_PATH.");
  process.exit(1);
}

const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
const triggeringRun = event.workflow_run;
const sha = triggeringRun?.head_sha;
const branch = triggeringRun?.head_branch;

if (!sha || !branch) {
  console.error("RELEASE CERTIFICATION: FAIL");
  console.error("workflow_run.head_sha/head_branch are required.");
  process.exit(1);
}

if (branch !== "develop") {
  console.log(`RELEASE CERTIFICATION: SKIP (branch=${branch})`);
  process.exit(0);
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
  { name: "Verification Matrix" },
  { name: "Tool Platform" },
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
  const runs = await api(`/repos/${owner}/${repo}/actions/workflows/${workflow.workflowId}/runs?per_page=50`);
  const matching = runs.workflow_runs
    .filter((run) => run.head_sha === sha && run.head_branch === branch && run.status === "completed")
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  const latestTwo = matching.slice(0, 2);
  if (latestTwo.length < 2) {
    failures.push(`${workflow.name}: requires 2 completed runs on ${sha}, found ${latestTwo.length}.`);
  } else if (latestTwo.some((run) => run.conclusion !== "success")) {
    failures.push(`${workflow.name}: the latest two completed runs on ${sha} are not both successful.`);
  }

  evidence.push({
    workflow: workflow.name,
    sha,
    branch,
    runs: latestTwo.map((run) => ({
      id: run.id,
      runNumber: run.run_number,
      conclusion: run.conclusion,
      event: run.event,
      completedAt: run.completed_at,
    })),
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
