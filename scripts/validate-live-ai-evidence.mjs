import { readFile } from "node:fs/promises";

const file = process.env.FLIXO_AI_LIVE_EVIDENCE ?? "ai-live-quality.json";
const expectedSha = process.env.GITHUB_SHA ?? process.argv[2];
if (!expectedSha) throw new Error("GITHUB_SHA is required for exact-SHA Live AI evidence");

const evidence = JSON.parse(await readFile(file, "utf8"));
const cases = Number(evidence.totalCases ?? evidence.summary?.totalCases ?? evidence.total ?? 0);
const passed = Number(evidence.passedCases ?? evidence.summary?.passedCases ?? evidence.passed ?? 0);
const unauthorized = Number(evidence.http401 ?? evidence.summary?.http401 ?? 0);
const sha = evidence.sha ?? evidence.buildSha ?? evidence.vercelSha ?? evidence.commitSha;
const eligible = evidence.certificationEligible ?? evidence.summary?.certificationEligible ?? false;

const failures = [];
if (cases !== 46) failures.push(`Expected 46 cases, got ${cases}`);
if (passed !== 46) failures.push(`Expected 46 passed cases, got ${passed}`);
if (unauthorized !== 0) failures.push(`Expected 401=0, got ${unauthorized}`);
if (sha !== expectedSha) failures.push(`SHA mismatch: evidence=${sha}, expected=${expectedSha}`);
if (eligible !== true) failures.push("certificationEligible is not true");

if (failures.length) {
  console.error("LIVE AI CERTIFICATION: BLOCKED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`LIVE AI CERTIFICATION: PASS — 46/46, 401=0, Same-SHA=${sha}, certificationEligible=true`);
