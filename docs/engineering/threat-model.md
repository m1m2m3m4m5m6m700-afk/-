# FLIXO Threat Model

Status: IMPLEMENTED / STRUCTURAL PASS

## Trust boundaries
- Browser ↔ public HTTP/API
- Public API ↔ server runtime
- Server runtime ↔ AI providers
- Server runtime ↔ PostgreSQL
- CI runner ↔ GitHub Actions secrets
- Build runner ↔ generated artifacts

## Assets
- AI provider tokens and application secrets
- User-uploaded documents/images
- Database records and credentials
- Build artifacts and provenance metadata
- Tool registry and runtime contracts

## Threat controls
| Threat | Boundary | Prevent / Detect |
|---|---|---|
| Secret leakage | CI / AI | redaction + Gitleaks + no raw log upload |
| Prompt injection | Runtime / AI | deterministic validation + advisory-only AI |
| XSS / HTML injection | Browser / server | output encoding + CodeQL + Semgrep |
| SSRF | Server / external URLs | allowlists + URL validation + timeouts |
| IDOR | API / data | server-side authorization + ownership checks |
| Dependency compromise | Build / registry | lockfile + OSV + dependency review + SBOM |
| Workflow compromise | GitHub Actions | Zizmor + actionlint + least privilege |
| Artifact tampering | Build / deploy | exact SHA + provenance |

High/Critical findings must block promotion once the corresponding gate is promoted to required.
