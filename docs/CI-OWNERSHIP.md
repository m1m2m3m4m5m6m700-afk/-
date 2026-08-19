# FLIXO CI Ownership

This document defines the role of each workflow so a future cleanup does not turn into a duplicate gate or a missing critical check.

| Workflow | Trigger | Critical / Advisory | Purpose |
|---|---|---|---|
| `tool-platform.yml` | PR to `main`, push `develop`, schedule, manual | Critical on PR/push; advisory scheduled/manual legacy paths | Foundation contracts, public tool registry, desktop smoke and repeatability |
| `ci.yml` | `main` push, manual | Critical | Full verification for production/mainline code |
| `security-advisory.yml` | `develop`, PR to `main`, weekly, manual | Advisory | Security scanning and dependency/security evidence |
| `dast-advisory.yml` | Manual | Advisory | OWASP ZAP baseline scan against an explicit deployment URL |
| `release-certification.yml` | Completion of release/tool workflows | Advisory until release policy promotes it | Cross-workflow certification evidence |
| `deploy.yml` | CI completion on `main`, manual | Deployment disabled during hardening; manual health check is safe | Production deployment placeholder plus manual deployment health verification |

## Rules

1. Critical workflows must have `concurrency.cancel-in-progress` enabled unless there is a documented reason not to.
2. Manual workflows that inspect a deployment must accept an explicit target URL or SHA; never infer a deployment from stale history.
3. Advisory workflows must not block the critical PR path unless their policy is explicitly promoted.
4. A workflow may not duplicate another workflow's critical gate without documenting the reason.
5. A deleted or renamed validator must have all references removed from workflows, `package.json`, and scripts before the change is considered complete.
6. Release readiness requires evidence from the same Git SHA across CI and deployment; a green Vercel commit status alone is not sufficient.
