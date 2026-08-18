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

const requiredWorkflows = ["Tool Platform", "Tool Release Candidate"];
const workflowList = await api(`/repos/${owner}/${repo}/actions/workflows`);
const resolved = requiredWorkflows.map((name) => {
  const match = workflowList.workflows.find((workflow) => workflow.name === name);
  if (!match) throw new Error(`Workflow not found: ${name}`);
  return { name, workflowId: match.id };
});

const failures = [];
const evidence = [];

for (const workflow of resolved) {
  const runs = await api(`/repos/${owner}/${repo}/actions/workflows/${workflow.workflowId}/runs?per_page=50`);
  const successful = runs.workflow_runs
    .filter(
      (run) =>
        run.head_sha === sha &&
        run.head_branch === branch &&
        run.status === "completed" &&
        run.conclusion === "success",
    )
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  if (successful.length === 0) {
    failures.push(`${workflow.name}: no successful completed run exists for ${sha}.`);
  }

  const latest = successful[0];
  evidence.push({
    workflow: workflow.name,
    sha,
    branch,
    proof: latest
      ? {
          id: latest.id,
          runNumber: latest.run_number,
          conclusion: latest.conclusion,
          event: latest.event,
          completedAt: latest.completed_at,
        }
      : null,
  });
}

if (failures.length) {
  console.error("RELEASE CERTIFICATION: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
}

console.log("RELEASE CERTIFICATION: PASS");
console.log("Two independent green proofs verified for the same commit:");
console.log(JSON.stringify(evidence, null, 2));
