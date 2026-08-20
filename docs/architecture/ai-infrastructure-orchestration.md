# FLIXO AI / Infrastructure Orchestration

## Boundary contract

```text
UI
  -> typed AI RPC
  -> security middleware + CSRF + rate limit
  -> aiService
  -> prompt/config + optional canonical tool context
  -> provider chain
```

The AI layer does **not** write to Drizzle directly and does not invoke Tool Runtime directly.

## Canonical tool context

`src/lib/ai/orchestration/context.ts` provides a read-only, ranked view of the canonical public Tool Registry.

It exposes only:
- tool id / slug / name
- category
- description
- local-only capability

It deliberately exposes no secrets, database handles, mutable registry objects, or runtime invocation methods.

## Optional runtime wiring

Set `FLIXO_AI_TOOL_CONTEXT=1` on the server to append the top three canonical tool candidates to the AI system prompt. The default remains disabled so the normal AI path has no extra token or latency cost.

## Decision and repair policy

The orchestration context is advisory. It cannot invoke a tool, write the database, apply a patch, or override deterministic gates.

All repair proposals remain:
- `autoApply=false`
- `requiresHumanReview=true`

## Agent integration

`cognitive-engine.mjs` remains deterministic and consumes project graph / decision history. `strategic-planner.mjs` remains plan-only and CI-gated. Future UI integration should call a dedicated orchestration endpoint rather than importing agent internals into React components.
