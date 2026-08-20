# Release Certification Gate

The release gate is the final stability boundary for FLIXO.

A commit is **Release Certified** only when all of the following are true:

1. Tool Platform succeeds for the exact commit SHA.
2. Tool Release Candidate succeeds for the exact commit SHA.
3. Tool Platform includes Strict Project Foundation and Strict Desktop Verification.
4. Tool Release Candidate completes the public-tool operational suite, production build, and production dependency audit.
5. These are treated as two independent green proofs of the same code state.
6. A failed, cancelled, skipped, or incomplete proof prevents certification.

## AI quality boundary

AI quality is a separate evidence layer. The repository currently has **AI Quality Infrastructure = 10/10**, but **Live AI Certification = Pending** until a real provider-backed live smoke run is completed for the exact commit SHA.

The live AI policy is defined in `docs/AI-QUALITY-CERTIFICATION.md`. Build success, TypeScript success, deterministic AI contract success, or Tool Platform certification must never be interpreted as proof of live model quality.

A new commit resets certification because the required proofs are SHA-specific.

The gate is implemented by `.github/workflows/release-certification.yml` and `scripts/validate-release-certification.mjs`.
