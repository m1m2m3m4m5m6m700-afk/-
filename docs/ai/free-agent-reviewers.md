# Free AI Reviewers for FLIXO

FLIXO keeps AI reviewers optional and advisory. The deterministic Error Intelligence Engine and security/quality gates remain authoritative.

## OpenRabbit

Free, open-source, self-hosted PR review in GitHub Actions. Supports pluggable providers such as OpenRouter and Groq. Recommended when you want the review to run entirely on the repository runner. citeturn993585search5

Workflow: `.github/workflows/ai-review-openrabbit.yml`

## Robin

MIT-licensed, free AI PR reviewer that runs in GitHub Actions and supports private repositories through BYOK. It accepts an OpenAI-compatible endpoint and can use free OpenRouter models. citeturn993585search0

Workflow: `.github/workflows/ai-review-robin.yml`

## PR-Agent

Open-source PR reviewer that can run as a GitHub Action and supports multiple model providers/configurations. The current project is the community-maintained open-source PR-Agent; its hosted Qodo offering is separate. citeturn993585search3turn337239search0

Workflow: `.github/workflows/ai-review-pr-agent.yml`

## Selection rule

Only one external AI reviewer should be enabled for normal PR review to avoid duplicate comments and conflicting recommendations. Keep these workflows manual unless a model/provider is explicitly configured and the repository owner accepts the external inference path.

All reviewer outputs remain advisory. They must not merge, deploy, or apply fixes automatically.
