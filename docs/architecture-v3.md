# FLIXO CI Repair Agent v3 — Architecture

## Goal

Add contextual reasoning and multi-step planning above Agent v1/v2 without granting LLM or ML authority to bypass contracts or verification.

## Current flow

```text
CI failure
  -> context.mjs
  -> cognitive/project-graph + decision-log
  -> cognitive/cognitive-engine.mjs
  -> diagnose.mjs (deterministic classification)
  -> planning/strategic-planner.mjs
  -> verifier.mjs
  -> dry-run / approval
  -> executor.mjs
  -> GitHub
  -> CI proof
```

## Cognitive Engine

`cognitive-engine.mjs` is deterministic in the first v3 implementation. It uses:

- `diagnose.mjs` classification.
- Project Graph relationships.
- Historical Decision Log records.
- Deterministic textual similarity for historical cases.
- Basic dependency/workflow impact signals.

Semantic embeddings and Vector DB integration are intentionally deferred until this deterministic foundation is proven in CI.

## Strategic Planner

`strategic-planner.mjs` creates conditional steps:

- Every step has `dependsOn`.
- Every step declares a validation gate.
- `autoApply` is always false at this layer.
- The plan is bounded to six steps and three attempts per root cause.
- `UNKNOWN` failures become `manual-review` rather than guessed repairs.

## Safety boundaries

- `verifier.mjs` remains the final guard.
- Dependency changes use `dependency-executor.mjs`.
- Protected release workflow remains outside normal repair scope.
- Green CI on the resulting SHA is the final proof requirement.
- Historical memory increases context but never overrides current evidence.

## Deferred v3 layers

After Cognitive Engine + Strategic Planner are proven in CI:

1. risk evaluator
2. alternatives generator
3. confidence scorer
4. trust interface
5. learning loop
6. proactive health system
7. optional LLM / semantic retrieval layer
