# Selected AI/Quality Tools

FLIXO integrates only tools that add a measurable capability without replacing the deterministic gates.

## Semgrep Community

Purpose: deterministic static security/code-pattern analysis in pull requests.

- Workflow: `.github/workflows/security-semgrep.yml`
- No provider secret is required for the Community CLI workflow.
- Metrics are disabled with `--metrics=off` to avoid unnecessary telemetry.
- Findings are advisory until explicitly promoted into a required security gate.

Semgrep Community is intentionally used as a static layer; deeper cross-file/data-flow AppSec analysis is a separate product tier and is not assumed here.

## Agentic QE

Purpose: change-impact analysis, dependency/complexity inspection, coverage-gap analysis, flaky/regression workflows, and test generation.

- Workflow: `.github/workflows/agentic-qe-manual.yml`
- Default workflow mode is deterministic-only (`AQE_LLM_ROUTER_DISABLED=1`).
- AI generation is manual and remains advisory; it is not allowed to write or auto-apply production fixes.
- When an approved provider is configured later, the same workflow can be used for AI-assisted generation without changing the repository contract.

## Deliberately not integrated yet

Snyk requires a `SNYK_TOKEN`, so it remains optional and is not a mandatory public-PR gate.

Cloud code-review products and unverified/free-tier claims are not hard-wired into FLIXO until their current licensing, privacy, and CI behavior are verified.
