# FLIXO Developer Onboarding

## Engineering model

FLIXO separates platform concerns into four practical areas:

- `src/lib/tool-runtime`: execution contracts and reusable tool runtime logic.
- `src/data`: catalog/legacy data; not a runtime dependency for new code.
- `src/routes`: user-facing routes and composition.
- `src/scripts`: automated architectural, lifecycle, security, quality, and release gates.

The repository favors small, explicit boundaries over broad framework layers. Do not introduce Core/Application/Infrastructure folders unless a concrete dependency boundary requires them.

## Verification flow

Before a tool is published, the following chain must pass:

`dependency integrity → architecture → lifecycle → typecheck → lint → build/routes → tool contract → real browser → output oracle → negative/edge cases → property/fuzz → security → performance → flaky/isolation → mutation/fault injection → evidence → release gate`

The primary operational command is:

```bash
npm run verify:project
```

For the strongest tool gate:

```bash
npm run verify:tool
```

## Adding a tool

1. Define the tool contract and lifecycle state.
2. Implement the core behavior with deterministic inputs and outputs.
3. Add the route/UI using existing shared tool components.
4. Add positive, negative, and edge-case checks.
5. Add an exact result oracle; checking only that a value exists is not sufficient.
6. Add repeatability and failure-quality expectations.
7. Run the full verification gate.
8. Only then promote the tool to `verified`, and later `public`.

## What not to do

- Do not bypass a gate with `test.only`, `skip`, or `fixme`.
- Do not weaken an assertion because the implementation currently fails it.
- Do not add a second public registry.
- Do not couple new runtime code to Legacy catalog internals.
- Do not add external infrastructure unless the feature actually requires it.

## Debugging a failure

Fix the first failing stage. Do not modify later gates to hide it. Preserve the failure evidence (trace, test result, expected/actual values) until the fix is verified.
