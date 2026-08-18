# Flixo CI Architecture

Flixo uses three CI layers with explicit responsibilities. New checks must be added to an existing layer unless there is a demonstrated isolation requirement.

## 1. Critical release gates

These workflows decide whether a change is eligible for release:

- `Verification Matrix` — canonical project verification and deployment-health checks.
- `Tool Platform` — strict tool/runtime lifecycle, desktop verification, mutation, invariants, evidence, and regression lock.
- `Release Certification` — validates that the required green evidence exists for the same commit.

A critical gate MUST be deterministic, reproducible, and blocking. Advisory checks must not be copied into this layer just to increase the number of green checks.

## 2. Consolidated advisory layers

### Security Advisory
`.github/workflows/security-advisory.yml` owns:

- repository secrets scanning
- Semgrep/SAST
- CodeQL JavaScript/TypeScript analysis
- production dependency audit evidence and inventory
- mutation evidence artifacts

Security checks can warn or publish evidence while their baselines mature. High-confidence blockers belong in the critical gates only after a stable false-positive baseline exists.

### Test Slices
`.github/workflows/test-slices.yml` owns diagnostic and quality slices:

- validator matrix for registry/runtime/SEO/localization/quality/security contracts
- typecheck and lint isolation
- repeated desktop edge regression (advisory)
- scheduled/manual Lighthouse performance and UX audit (advisory)

The matrix is intentionally diagnostic: a failure identifies the failing slice instead of collapsing into one long `npm test` failure.

## 3. Manual / operational workflows

- `DAST Advisory` — manual OWASP ZAP scan against an explicit Preview/Staging URL.
- `Renovate` — dependency update automation; not a release gate.
- `Deploy` — intentionally disabled during hardening until an explicit release decision re-enables it.
- `Self-heal` / maintenance workflows — operational tooling only; they must never silently rewrite production state.

## Rules for future additions

1. Do not create a new workflow when an existing layer can own the check.
2. Prefer a new job inside `Security Advisory` or `Test Slices` over another top-level workflow.
3. Keep critical release gates small and deterministic.
4. Advisory jobs must publish evidence and be safe to retry.
5. Manual security scans must never be required for an ordinary pull request.
6. Every AI agent must check existing open PRs before creating a new one and must update an existing branch when the same root cause is already being addressed.
