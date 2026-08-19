import fs from "node:fs";

const failures = [];
const workflow = fs.readFileSync(".github/workflows/release-certification.yml", "utf8");
const script = fs.readFileSync("scripts/validate-release-certification.mjs", "utf8");
const docs = fs.readFileSync("docs/RELEASE-CERTIFICATION.md", "utf8");

const requiredWorkflowNames = ["Tool Platform", "Tool Release Candidate"];

for (const name of requiredWorkflowNames) {
  if (!workflow.includes(name)) {
    failures.push(`Release certification must observe ${name}.`);
  }
}

if (!workflow.includes("workflow_run") || !workflow.includes("types: [completed]")) {
  failures.push("Release certification must be driven by completed workflow runs.");
}

if (
  !script.includes("run.head_sha === sha") ||
  !script.includes("run.status === \"completed\"") ||
  !script.includes("run.conclusion === \"success\"") ||
  !script.includes("const requiredWorkflows = [\"Tool Platform\", \"Tool Release Candidate\"]")
) {
  failures.push("Release certification must require successful Tool Platform and Tool Release Candidate proofs on the same SHA.");
}

if (
  !docs.includes("Tool Platform succeeds for the exact commit SHA") ||
  !docs.includes("Tool Release Candidate succeeds for the exact commit SHA") ||
  !docs.includes("two independent green proofs of the same code state")
) {
  failures.push("Release certification documentation must define the two-workflow same-SHA proof rule.");
}

if (failures.length) {
  console.error("RELEASE GATE CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("RELEASE GATE CONTRACT: PASS");
