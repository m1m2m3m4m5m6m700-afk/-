# Release Certification Gate

The release gate is the final stability boundary for FLIXO.

A commit is **Release Certified** only when all of the following are true:

1. Verification Matrix succeeds.
2. Tool Platform succeeds, including Strict Project Foundation and Strict Desktop Verification.
3. Desktop evidence and regression locks pass.
4. The latest two completed Verification Matrix runs for the same `develop` SHA are successful.
5. The latest two completed Tool Platform runs for the same `develop` SHA are successful.
6. A failed, cancelled, or incomplete run prevents certification.

A new commit resets certification because the required two-pass history is SHA-specific.

The gate is implemented by `.github/workflows/release-certification.yml` and `scripts/validate-release-certification.mjs`.
