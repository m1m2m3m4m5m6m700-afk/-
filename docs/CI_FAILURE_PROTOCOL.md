# FLIXO CI Failure Protocol — Evidence First

## Rule 1 — No guessing
Never modify product code, workflow logic, dependencies, or tests based only on a red/aborted status. The exact failing job, step, and log evidence must be identified first.

## Rule 2 — First root failure
When multiple jobs fail, diagnose the earliest/root failure. Downstream failures are not treated as independent defects until the upstream cause is cleared.

## Rule 3 — Environment before product
Classify failures as environment, CI configuration, dependency/network, external service, or product/code before proposing a fix.

## Rule 4 — Unknown means stop
If diagnosis confidence is `NONE` or `AMBIGUOUS`, the allowed action is evidence gathering only. No speculative patch is allowed.

## Rule 5 — Re-run policy
A re-run is allowed only when:
- the failure is transient/environmental and the cause is evidenced, or
- a code/config fix has been committed and the affected gate is being revalidated.

## Rule 6 — Repair scope
A fix must target the diagnosed failure class and avoid unrelated refactors.

## Diagnostic record
Every failure diagnosis must record:
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
