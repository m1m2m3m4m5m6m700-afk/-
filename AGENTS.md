# AGENTS.md

This file defines the engineering, safety, testing, and agent-operation rules for Flixo Tools.

## AI/PR discipline

Automation and AI agents must treat the repository as a shared stateful system, not as a disposable workspace.

- Never open a new PR for a problem already targeted by an existing open PR. Reuse the existing branch and push the next root-cause fix there.
- Before opening a PR, inspect the repository's open PRs and search for an existing branch, title, or issue addressing the same failure.
- One recurring CI failure gets one root-cause investigation. Do not repeat an already attempted fix without first explaining why the failure regressed or why the previous fix was insufficient.
- Do not create a second PR merely because the first PR is waiting for CI. Update the existing PR unless its scope is intentionally superseded.
- When a later PR supersedes an earlier one, close the obsolete PR or explicitly mark it as superseded; do not leave competing fixes active.
- Do not merge, force-push, or rewrite shared branches solely to make a check green. Preserve the diagnostic history.
- Treat `develop` as the integration branch for current engineering work. Do not redirect active work to `main` merely to bypass an `develop` check.
- Never weaken a release gate, replace a failure with a warning, or add `continue-on-error` to a critical check solely to obtain a green status.
- Keep advisory security/performance experiments outside the critical release path until their signal quality and runtime stability are proven.
- When a CI command is a long serial chain, identify and run the failing contract directly rather than applying speculative fixes to unrelated validators.
- After a root-cause fix, rerun the smallest relevant check first, then the dependent workflow, then the full release gate.
- Record architectural or workflow changes in the same commit/PR that changes the behavior so future agents do not rely on stale documentation.
