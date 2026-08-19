# FLIXO Security & Test Baseline

## Baseline identity

- Branch: `develop`
- Baseline SHA: `26cec43ff331b2f59a4a749e2f45d0ae417fe3dc`
- Stable reference: `stable/develop-green-2026-08-18`
- Verification Matrix: run #45 — success
- Tool Platform: run #255 — success
- Vercel: success

## Critical release gates

The following gates are release-critical and must remain blocking:

- CI contract
- Dependency contract and production dependency health
- Tool platform lifecycle and boundaries
- Strict security and security contract
- Property fuzzing and fault injection
- Route/build/typecheck/lint contracts
- Desktop verification and repeatability
- Tool-specific security and boundary contracts
- Mutation testing
- Tool invariants and golden fixtures
- Regression lock
- Verification evidence
- Release certification for the same SHA

## Advisory security layer

The following checks are intentionally advisory until their false-positive rate and runtime are understood:

- Secrets scanning
- SAST / semantic security scanning
- Independent supply-chain scanning
- Expanded edge-case security checks
- Mutation evidence reporting

Advisory checks must never weaken or bypass a critical gate.

## Security expectations

The current critical security layer verifies CSRF handling, constant-time signature comparison, security headers, same-origin chat requests, Vite host allow-listing, production dependency auditing, and restrictions on unsafe runtime code execution.

## Testing expectations

The current critical test layer includes contract validation, property fuzzing, fault injection, mutation testing, browser/desktop verification, repeatability, tool-specific boundary tests, evidence preservation, invariants, and regression locking.

## Change policy

Every future change must preserve the baseline or establish a new green baseline with the same evidence. A new baseline is valid only after all critical gates are green on the same commit SHA.
