# FLIXO CI Repair Agent v3.0

## Mission

Build an evidence-first engineering agent that combines contextual awareness, deterministic diagnosis, strategic multi-step planning, safe execution, learning, and proactive health checks without allowing AI/ML to bypass contracts or human controls.

## Architecture

```text
CI / user request
  -> context
  -> cognitive engine
  -> deterministic diagnosis
  -> strategic planner
  -> trust / verifier
  -> dry-run / human approval
  -> executor
  -> CI proof
  -> learning + proactive health
```

## v3 foundations implemented first

- `scripts/flixo-agent/cognitive/cognitive-engine.mjs`
- `scripts/flixo-agent/planning/strategic-planner.mjs`
- `scripts/flixo-agent/tests/v3-strategic-planning.test.mjs`
- `docs/architecture-v3.md`

## Non-negotiable rules

1. Evidence outranks model output.
2. `diagnose.mjs` remains deterministic and authoritative for classification.
3. Historical memory informs confidence but never proves a current repair.
4. Strategic plans are conditional and must wait for CI verification between dependent steps.
5. `autoApply` remains false at the planning layer.
6. Dependency changes use the sandbox executor and synchronize `package.json` with `package-lock.json`.
7. Protected release policy and schema changes require human intervention.
8. Unknown failures escalate instead of being guessed.
9. Maximum automated attempts per root cause: 3.
10. No repair is considered proven until the resulting SHA has confirming CI evidence.

## LLM / ML boundary

LLM and ML components may summarize, retrieve similar cases, rank alternatives, or propose hypotheses. They must not bypass the verifier, schemas, policy, branch protection, sandbox execution, or human approval requirements.

## Planned next layers

After the deterministic v3 core is proven in CI:

- risk evaluator
- alternatives generator
- confidence scorer
- trust interface
- adaptive learning loop
- proactive health system
- optional semantic embeddings / vector retrieval
