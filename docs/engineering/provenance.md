# FLIXO Build Provenance

Status: IMPLEMENTED / STRUCTURAL PASS

Required evidence chain:
`source SHA → workflow run → dependency lock → build → artifact → deployment`

## Required controls
- Exact commit SHA recorded in every release report.
- Build artifacts are immutable after creation.
- Dependencies are resolved from `package-lock.json`.
- GitHub Actions permissions remain least-privilege.
- Release artifacts must carry a provenance/attestation step before production promotion.

## Current boundary
The repository now has structural provenance documentation and exact-SHA CI evidence. External deployment attestation remains LIVE-PENDING until the deployment provider accepts and exposes the artifact provenance.
