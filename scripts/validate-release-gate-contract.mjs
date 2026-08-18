import fs from "node:fs";

const failures = [];
const workflow = fs.readFileSync(".github/workflows/release-certification.yml", "utf8");
const script = fs.readFileSync("scripts/validate-release-certification.mjs", "utf8");
const docs = fs.readFileSync("docs/RELEASE-CERTIFICATION.md", "utf8");

if (!workflow.includes("Verification Matrix") || !workflow.includes("Tool Platform")) {
  failures.push("Release certification must observe Verification Matrix and Tool Platform.");
}
if (!workflow.includes("workflow_run") || !workflow.includes("types: [completed]")) {
  failures.push("Release certification must be driven by completed workflow runs.");
}
if (
  !script.includes("run.head_sha === sha") ||
  !script.includes("run.status === \"completed\"") ||
  !script.includes("run.conclusion === \"success\"") ||
  !script.includes("const requiredWorkflows = [\"Verification Matrix\", \"Tool Platform\"]")
) {
  failures.push("Release certification must require successful Verification Matrix and Tool Platform proofs on the same SHA.");
}
if (
  !docs.includes("Verification Matrix succeeds for the exact commit SHA") ||
  !docs.includes("Tool Platform succeeds for the exact commit SHA") ||
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
