# Flixo CI Architecture

Flixo uses explicit CI layers with separate responsibilities. New checks must be added to an existing layer unless there is a demonstrated isolation requirement.

## 1. Critical release gates

These workflows participate in release eligibility:

- `Tool Platform` — strict tool/runtime lifecycle, desktop verification, evidence, regression locks, and release-oriented contracts.
- `Tool Release Candidate` — public-tool operational verification, production build, and production dependency audit.
- `Release Certification` — verifies that both required green proofs exist for the exact same `develop` commit SHA.

A critical gate MUST be deterministic, reproducible, and blocking. Advisory checks must not be copied into this layer merely to increase the number of green checks.

## 2. Consolidated CI and advisory layers

### CI
`.github/workflows/ci.yml` owns the canonical full verification pipeline for `main` and is intentionally separate from the `develop` tool-platform release path during hardening.

### Test Slices
`.github/workflows/test-slices.yml` owns diagnostic and quality slices:

- registry/runtime and contract validator matrix
- typecheck and lint isolation
- repeated desktop edge regression (advisory)
- scheduled/manual Lighthouse performance and UX audit (advisory)
- scheduled/manual localization and PDF roadmap reports

The matrix is intentionally diagnostic: a failure identifies the failing slice instead of collapsing into one long `npm test` failure.

### Security Advisory
`.github/workflows/security-advisory.yml` owns security-focused and evidence-only checks such as secrets scanning, SAST/CodeQL, dependency security evidence, and mutation evidence.

## 3. Manual / operational workflows

- `DAST Advisory` — manual dynamic security scan against an explicit Preview/Staging URL.
- `Deploy` — intentionally disabled during integration hardening until an explicit release decision re-enables production deployment.
- `Self-heal` / maintenance workflows — operational tooling only; they must never silently rewrite production state.
- `Prune Auto Fix` — maintenance for obsolete auto-fix branches/PR state.

## Release proof rule

A release is not certified because the code builds or because one workflow is green. Certification requires:

1. `Tool Platform` completed successfully for the exact commit SHA.
2. `Tool Release Candidate` completed successfully for the exact commit SHA.
3. `Release Certification` verifies both proofs.

If either required proof is missing, cancelled, failed, or belongs to a different SHA, certification fails.

## Rules for future additions

1. Do not create a new workflow when an existing layer can own the check.
2. Prefer a new job inside `Security Advisory` or `Test Slices` over another top-level workflow.
3. Keep critical release gates small and deterministic.
4. Advisory jobs must publish evidence and be safe to retry.
5. Manual security scans must never be required for an ordinary pull request.
6. Workflow contracts must reference only workflows that actually exist in `.github/workflows/`.
7. Every AI agent must check existing open PRs before creating a new one and must update an existing branch when the same root cause is already being addressed.
