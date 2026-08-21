# FLIXO Free AI Integrations

## Verified candidates

### LiveReview Community
- Self-hosted Community Edition is free.
- Supports GitHub and multiple AI providers, including local/self-hosted options.
- Use as an external review surface; FLIXO remains the source of truth for merge gates.

### Agentic QE Fleet
- Open-source QA/QE agent platform.
- Supports Playwright and TypeScript-oriented workflows and can run with local/free-tier models.
- Recommended role: advisory test generation, flaky-test analysis, regression analysis.

## Not enabled as a hard dependency

### GitHubnext TestPilot
The original GitHubnext TestPilot repository is archived and describes itself as a research prototype. It is therefore not installed as a production dependency.

### Unverified tools from the original proposal
GHAGGA, Pullfrog, and similarly named third-party services are not hard-wired into FLIXO until their repository, license, current status, and integration contract are independently verified.

## FLIXO integration rule
All external AI tooling remains advisory:
- no automatic code modification;
- no automatic merge approval;
- no raw secrets or unredacted CI logs are sent externally;
- deterministic validators run before AI review;
- reports are stored as artifacts and fed into Error Intelligence / Failure Memory only after sanitization.
