# Release Certification Gate

The release gate is the final stability boundary for FLIXO.

A commit is **Release Certified** only when all of the following are true:

1. Verification Matrix succeeds for the exact commit SHA.
2. Tool Platform succeeds for the exact commit SHA, including Strict Project Foundation and Strict Desktop Verification.
3. Desktop evidence and regression locks pass.
4. A successful Verification Matrix run exists for the exact `develop` SHA.
5. A successful Tool Platform run exists for the exact `develop` SHA.
6. These are treated as two independent green proofs of the same code state.
7. A failed, cancelled, or incomplete proof prevents certification.

A new commit resets certification because the required proofs are SHA-specific.

The gate is implemented by `.github/workflows/release-certification.yml` and `scripts/validate-release-certification.mjs`.
