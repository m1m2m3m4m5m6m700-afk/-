import process from "node:process";
import fs from "node:fs";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const eventPath = process.env.GITHUB_EVENT_PATH;
const sha = process.env.GITHUB_SHA;

if (!token || !repository || !eventPath || !sha) {
  console.error("DEPLOYMENT HEALTH: FAIL");
  console.error("Missing GitHub runtime context.");
  process.exit(1);
}

const [owner, repo] = repository.split("/");
const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}/status`, {
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "flixo-deployment-health",
  },
});

if (!response.ok) {
  console.error("DEPLOYMENT HEALTH: FAIL");
  console.error(`GitHub API returned ${response.status}.`);
  process.exit(1);
}

const payload = await response.json();
const statuses = payload.statuses ?? [];
const deployment = statuses.find((status) => status.context === "Vercel");

if (!deployment) {
  console.log("DEPLOYMENT HEALTH: PASS (no Vercel status reported)");
  process.exit(0);
}

if (deployment.state === "success") {
  console.log("DEPLOYMENT HEALTH: PASS (Vercel success)");
  process.exit(0);
}

const target = String(deployment.target_url ?? "");
if (/build-rate-limit|upgradeToPro/i.test(target)) {
  console.warn("DEPLOYMENT HEALTH: EXTERNAL_LIMIT (Vercel build rate limit; CI code gates remain authoritative)");
  process.exit(0);
}

console.error("DEPLOYMENT HEALTH: FAIL (deployment provider reported a non-rate-limit failure)");
console.error(JSON.stringify({ state: deployment.state, description: deployment.description, target_url: deployment.target_url }, null, 2));
process.exit(1);
