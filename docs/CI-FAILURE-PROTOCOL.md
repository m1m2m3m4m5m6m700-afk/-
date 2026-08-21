# CI Failure Protocol — Evidence First

Use this protocol for every red gate. The goal is to repair the root cause without hiding failures behind retries, new validators, self-healing mutations, or unrelated refactors.

## Diagnostic order

1. Capture the exact run ID and commit SHA.
2. Identify the first failing job and first failing step.
3. Read the failed step log before editing code.
4. Classify the failure as environment, CI configuration, dependency/network, external service, product/code, build, deployment, or advisory.
5. Diagnose the earliest/root failure before treating downstream failures as independent defects.
6. If confidence is `NONE` or `AMBIGUOUS`, gather evidence only; do not make a speculative patch.

## Repair order

1. Fix one root cause at a time.
2. Re-run the smallest affected gate first.
3. Only after the focused gate passes, run the full critical release path.
4. A re-run is justified only for an evidenced transient/environmental failure or after a committed fix is being revalidated.

## Blocking policy

- Environment, dependency, core, contract, E2E, build, and deployment failures block release certification.
- Advisory findings publish evidence but never authorize claiming a green release.
- A skipped, cancelled, queued, or missing gate is not a green gate.
- A successful run for a different commit SHA is not evidence for the current commit.

## Anti-regression rules

- Do not add a new workflow solely to work around a failing existing gate.
- Do not delete a failing check until its responsibility is proven redundant or intentionally moved.
- Do not mutate product code, dependencies, security settings, or lockfiles automatically from CI failures.
- Keep `package.json` and `package-lock.json` reproducible.
- Every deleted workflow/check reference must be removed from code, workflows, and documentation in the same change series.

## Diagnostic record

Every failure diagnosis should record:

- run ID
- commit SHA
- first failing job
- first failing step
- failure class
- confidence
- evidence excerpt
- repair rule
- whether repair is allowed

## Canonical states

`NO_FAILURE` → `DIAGNOSED` → `FIXED_AND_REVALIDATING`

or

`UNKNOWN` / `AMBIGUOUS` → evidence gathering only.
