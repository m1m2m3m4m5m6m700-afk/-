# FLIXO Engineering Status — 2026-08-20

## Current verdict

- Overall engineering readiness: **9.7/10**
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

### CI evidence
- GitHub Runner was reached successfully by CI Run #897.
- Steps 1–9 completed successfully: CI contract, dependency contract, clean install, lockfile stability, production audit, and Chromium setup.
- The canonical test gate remains unresolved/in-progress in the available evidence; therefore P0.1 is not certified yet.

### Promotion governance
- A dedicated Promotion Gate workflow exists for `experimental -> main` pull requests.
- The gate checks the candidate source branch, exact candidate SHA, successful CI/AI Guardian/project-diagnosis evidence, and main branch protection before allowing auto-merge.
- Auto-merge is therefore fail-closed while `main` protection is absent.

## Known blockers

1. `main` branch protection is not enabled in the current GitHub repository settings.
2. Repository-level Auto-Merge is disabled.
3. CI Run #897 has not produced a final canonical test result in the evidence available to this review.
4. Vercel production deployment remains intentionally disabled during hardening.

## Closed validation PRs

- PR #93: temporary real-runner verification; closed without merge.
- PR #94: temporary promotion-governance validation; closed without merge.

## Release rule

No Auto-Promotion and no production deployment are permitted until:

`CI PASS -> Certification on same SHA -> main protection + required checks -> Promotion Gate PASS -> Auto-Merge -> Deployment`
