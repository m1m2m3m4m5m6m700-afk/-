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

### CI evidence and timeout hardening
- GitHub Runner was reached successfully by CI Run #897.
- Steps 1–9 completed successfully: CI contract, dependency contract, clean install, lockfile stability, production audit, and Chromium setup.
- Run #897 remains stuck in `Run canonical test gate` with no final conclusion in the available evidence.
- Root cause identified at the CI/test-harness level: Playwright allowed up to **20 minutes per test** with no independent shell timeout for the canonical `npm test` command, allowing a hung test to leave the runner unresolved.
- Fixed on `experimental` by commit `1bdd56e1a1e667e1e4f26aa18eef2d8b5cdb5bae`: Playwright test timeout reduced to 5 minutes, action/navigation timeouts set to 30 seconds.
- Fixed on `experimental` by commit `04f0df006f6e834b78b6544bc7cea98050b84adf`: CI now runs `npm test` under an explicit 30-minute shell timeout and always stores `diagnostics/npm-test.log`, test results, and Playwright reports as artifacts.
- A temporary validation PR #95 was created to exercise the hardened gate; it is validation-only and must not be merged.
- The new PR run is not surfaced by the current GitHub connector, so the timeout fix is **implemented but not yet operationally certified**.

### Promotion governance
- A dedicated Promotion Gate workflow exists for `experimental -> main` pull requests.
- The gate checks the candidate source branch, exact candidate SHA, successful CI/AI Guardian/project-diagnosis evidence, and main branch protection before allowing auto-merge.
- Auto-merge is therefore fail-closed while `main` protection is absent.

## Known blockers

1. `main` branch protection is not enabled in the current GitHub repository settings.
2. Repository-level Auto-Merge is disabled.
3. CI Run #897 has not produced a final canonical test result in the evidence available to this review.
4. The timeout hardening fix has not yet received a visible GitHub Runner result through the current connector.
5. Vercel production deployment remains intentionally disabled during hardening.

## Closed validation PRs

- PR #93: temporary real-runner verification; closed without merge.
- PR #94: temporary promotion-governance validation; closed without merge.
- PR #95: temporary CI timeout validation; created for evidence only and must remain unmerged.

## Release rule

No Auto-Promotion and no production deployment are permitted until:

`CI PASS -> Certification on same SHA -> main protection + required checks -> Promotion Gate PASS -> Auto-Merge -> Deployment`
