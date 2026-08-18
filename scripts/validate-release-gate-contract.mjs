import fs from "node:fs";

const failures = [];
const workflow = fs.readFileSync(".github/workflows/release-certification.yml", "utf8");
const script = fs.readFileSync("scripts/validate-release-certification.mjs", "utf8");
const docs = fs.readFileSync("docs/RELEASE-CERTIFICATION.md", "utf8");

const requiredWorkflows = ["Tool Platform", "Tool Release Candidate"];

for (const name of requiredWorkflows) {
  if (!workflow.includes(name)) failures.push(`Release certification workflow must observe ${name}.`);
  if (!script.includes(`\"${name}\"`)) failures.push(`Release certification script must require ${name}.`);
  if (!docs.includes(`${name} succeeds for the exact commit SHA`)) {
    failures.push(`Release certification documentation must define ${name} for the exact commit SHA.`);
  }
}

if (!workflow.includes("workflow_run") || !workflow.includes("types: [completed]")) {
  failures.push("Release certification must be driven by completed workflow runs.");
}

for (const proof of ["run.head_sha === sha", "run.status === \"completed\"", "run.conclusion === \"success\""]) {
  if (!script.includes(proof)) failures.push(`Release certification must enforce ${proof}.`);
}

if (!docs.includes("two independent green proofs of the same code state")) {
  failures.push("Release certification documentation must define the same-SHA proof rule.");
}

if (failures.length) {
  console.error("RELEASE GATE CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("RELEASE GATE CONTRACT: PASS");
