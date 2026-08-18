# CI Failure Protocol

Use this protocol for every red gate. The goal is to repair root causes without hiding failures behind retries, new validators, or unrelated refactors.

## Order of response

1. Capture the exact failing run SHA and the first failing job/step.
2. Read the failed step log before editing code.
3. Classify the failure as environment, dependency, Core, Contract, E2E/behavioral, build, deployment, or Advisory.
4. Fix one root cause at a time and rerun the smallest affected gate.
5. Only after the focused gate passes, run the full critical release path again.

## Blocking policy

- Environment/dependency/Core/Contract/E2E/build/deployment failures block release certification.
- Advisory failures publish evidence but do not authorize claiming a green release.
- A skipped, cancelled, queued, or missing gate is not a green gate.
- A successful run for a different commit SHA is not evidence for the current commit.

## Anti-regression rules

- Do not add a new workflow solely to work around a failing existing gate.
- Do not delete a failing check until its responsibility is proven redundant or intentionally moved.
- Every deleted workflow/check reference must be removed from code, workflows, and documentation in the same change series.
- Dependency changes must keep `package.json` and `package-lock.json` reproducible; the package/lock preflight runs before `npm ci` in critical tool workflows.
