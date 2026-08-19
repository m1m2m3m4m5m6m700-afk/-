# FLIXO Engineering Status — 2026-08-20

## Current verdict

- Overall engineering readiness: **9.6/10**
- Development branch: **experimental**
- Production branch: **main**
- Production deployment: **disabled during hardening**
- Automatic production promotion: **blocked by design** until branch protection + required checks are enabled.

## Verified components

### Early defense
- Preflight Guardian is restricted to `experimental` for automatic pre-CI repair.
- AI Guardian runs on `experimental` and gates Health + Localization reports.
- V3 project diagnosis is read-only and produces a diagnosis artifact.

### Diagnosis / planning
- V1/V2/V3 detect known patterns, add context, build deterministic assessments, and produce strategic plans.
- Unknown or unsafe cases remain manual-review rather than being guessed or auto-mutated.

### Execution / self-heal
- V4/Self-Heal is restricted to `experimental`.
- Automatic dependency repair is limited to `package-lock.json`.
- `package.json` is treated as immutable during lockfile repair.
- Repair must pass `npm ci --ignore-scripts` and `npm run validate:dependencies`.
- Repairs never write directly to `main`.
- Rollback is hardened: if an auto-fix branch was pushed but PR creation fails, Self-Heal now deletes the remote branch before escalating.
- The auto-apply policy is now semantically explicit: only `lockfile-fixer` candidates with `autoApplyAllowed === true` and confidence >= 0.85 are executable; all others escalate.

### CI evidence and timeout hardening
- GitHub Runner was reached successfully by CI Run #897.
- Steps 1–9 completed successfully: CI contract, dependency contract, clean install, lockfile stability, production audit, and Chromium setup.
- Run #897 remains stuck in `Run canonical test gate` with no final conclusion in the available evidence.
- Root cause identified at the CI/test-harness level: Playwright allowed up to **20 minutes per test** with no independent shell timeout for the canonical test command, allowing a hung test to leave the runner unresolved.
- Playwright hardening applied on `experimental`: test timeout reduced to 5 minutes, action/navigation timeouts set to 30 seconds.
- CI hardening applied on `experimental`: canonical verification is executed through `npm run verify` under a 35-minute shell timeout with TERM/KILL escalation and always-on diagnostic artifacts.
- CI contract validation rejects configurations that omit `scripts.verify` or the canonical `npm run verify` gate or required timeout policy.
- Promotion auto-merge permissions were corrected: the Promotion Gate requests `contents: write` plus `pull-requests: write` for the final merge operation.
- Promotion Gate requires production-safe `main` protection: required status checks, pull-request review protection, and administrator enforcement must all be enabled before promotion can pass.
- Current `experimental` head: `468465cac3894fc52ab21c9a22fd949e01bf277d`.
- Temporary validation PR #96 was created against `experimental`, but the current GitHub connector exposed only a Vercel failure status and no CI Run/check for that PR. PR #96 was closed without merge.

### Promotion governance
- A dedicated Promotion Gate workflow exists for `experimental -> main` pull requests.
- The gate checks the candidate source branch, exact candidate SHA, successful CI/AI Guardian/project-diagnosis evidence, and production-safe `main` branch protection before allowing auto-merge.
- Auto-merge is therefore fail-closed while `main` protection is absent or incomplete.

## Known blockers

1. `main` branch protection is not enabled in the current GitHub repository settings.
2. Repository-level Auto-Merge is disabled (`allow_auto_merge: false`).
3. CI Run #897 has not produced a final canonical test result in the available evidence.
4. The hardened `npm run verify` gate has not yet produced a visible GitHub Runner result through the current connector; implementation is complete, operational certification is still pending.
5. The Vercel status currently reports an external deployment/rate-limit failure; production deployment remains intentionally disabled during hardening.

## Closed validation PRs

- PR #93: temporary real-runner verification; closed without merge.
- PR #94: temporary promotion-governance validation; closed without merge.
- PR #95: temporary CI timeout validation; closed without merge.
- PR #96: temporary hardened verify-gate validation; closed without merge.

## Release rule

No Auto-Promotion and no production deployment are permitted until:

`CI PASS -> Certification on same SHA -> main protection + required checks + PR review + admin enforcement -> Promotion Gate PASS -> Auto-Merge -> Deployment`
