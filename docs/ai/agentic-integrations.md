# FLIXO Agentic Integrations

## GitHub Agentic Workflows

`flixo-ci-diagnosis.md` is intentionally authored as a guarded, read-only agentic workflow source.

Guardrails:
- `workflow_dispatch` only
- repository contents/actions/issues/PRs are read-only
- no safe outputs
- no file edits, PR creation, merge, or deployment
- must consume Error Intelligence evidence first
- `autoApply=false`
- `requiresHumanReview=true`

GitHub Agentic Workflows are currently Public Preview and require a configured AI engine. They are not an inherently free service: GitHub documents both Actions usage and inference costs. Before activation, compile the source with the current `gh aw` CLI and review the generated lock workflow.

## SonarQube Agentic Analysis

Do not make this a required FLIXO gate yet. Current Sonar documentation describes Agentic Analysis as a SonarQube Cloud capability requiring an active paid Cloud account and a project-specific MCP configuration. It can later serve as a deterministic verification tool inside an AI coding loop, but it is not part of the current free/required baseline.

## Qodo

Qodo offers a free path for qualified open-source repositories, but this repository is currently private. Do not add Qodo as a required gate unless the repository becomes eligible for the open-source program or a paid plan is explicitly chosen.

## Selection rule

FLIXO keeps deterministic CI/SAST/registry validators authoritative. Agentic tools are advisory and may explain or prioritize failures, but they must not override Release Gates, Promotion Gate, or Live AI certification.
