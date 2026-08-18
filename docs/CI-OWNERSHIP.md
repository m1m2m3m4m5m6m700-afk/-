# CI Ownership and Blocking Policy

Use this table as the human-readable map of the current CI topology. The workflow files remain the executable source of truth; this document exists to prevent accidental duplication or orphaned gates.

| Workflow | Trigger | Blocking role | Responsibility |
|---|---|---|---|
| `ci.yml` | `main` push/manual | Blocking | Canonical full verification for main |
| `test-slices.yml` | PR/main + `develop` push + schedule/manual | Mixed | Fast/contract diagnostics and advisory quality slices |
| `tool-platform.yml` | tool-related PRs + `develop` push + schedule/manual | Blocking for tool release path | Tool platform foundation, desktop verification, evidence and regression locks |
| `tool-release-candidate.yml` | tool-related PRs + `develop` push + manual | Blocking for public-tool release | Operational tool verification, build and production audit |
| `release-certification.yml` | completion of required tool workflows | Blocking | Same-SHA certification using Tool Platform + Tool Release Candidate |
| `security-advisory.yml` | security triggers/schedule/manual | Advisory except explicit high-confidence gates | Security evidence and analysis |
| `dast-advisory.yml` | manual/advisory trigger | Advisory | Dynamic security scan against explicit target |
| `deploy.yml` | workflow completion/manual | Disabled during hardening | Production deployment placeholder until release approval |
| `self-heal.yml` | manual | Operational only | Diagnosis and evidence; no silent repository mutation |
| `prune-auto-fix.yml` | maintenance/manual | Operational only | Cleanup of obsolete auto-fix branches/PR state |

## Change rules

- Do not add a new workflow when an existing workflow can own the check.
- Any workflow name referenced by a release contract must exist in `.github/workflows/`.
- Blocking checks must be deterministic and reproducible.
- Advisory checks must not become blocking implicitly.
- A deleted workflow requires the release-contract and documentation references to be updated in the same change series.
