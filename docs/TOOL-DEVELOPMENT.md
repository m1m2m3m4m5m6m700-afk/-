# Tool Development Architecture

## Goal

Flixo uses a promotion-first tool platform. Legacy code is preserved, but it cannot become public implicitly.

## Layers

```text
Legacy source
    |
    v
Tool Platform Contract
    |
    +-- Manifest
    +-- Runtime contract
    +-- Test contract
    +-- Promotion state
    |
    v
Public Tool Registry
    |
    v
Compatibility adapters / routes
```

### 1. Legacy layer

Existing source under `src/data/`, `src/lib/tool-runtime/tools/`, old routes, and old tests is retained for rollback and migration. It is not a public source of truth.

### 2. Tool Platform layer

`src/lib/tool-platform/` is the only new extension API. It contains:

- `types.ts` — stable manifest, capability, runtime, and evidence contracts.
- `manifest.ts` — structural manifest validation.
- `registry.ts` — duplicate-safe in-memory registry primitives.
- `promotion.ts` — lifecycle transitions and the public evidence gate.
- `test-contract.ts` — reusable behavioral test contract.
- `public-registry.ts` — the single public registration point.
- `index.ts` — stable import surface for future tools.

The platform does not import `src/data/tools.ts`.

### 3. Compatibility layer

`src/lib/tool-runtime/readyTools.ts` is an adapter for existing route code. It derives its contents from `publicToolRegistrations`; it must not import legacy runtime modules directly.

## Lifecycle

```text
draft -> implemented -> tested -> verified -> public
```

Transitions are sequential. A public promotion requires evidence for implementation, route, test, runtime contract, typecheck, lint, and build.

## Manifest requirements

Every future tool manifest must declare:

- stable `id` and `slug`
- category
- version
- lifecycle state
- input/output capabilities
- local-only behavior
- optional limits
- runtime module
- route module
- test module

## Testing layers

- `verify:baseline` validates the technical platform and does not execute legacy product suites.
- `verify:tool` validates the platform, typecheck/lint/build, and the promoted tool regression suite.
- `verify:full` runs the historical full suite and production audit.

Tool browser tests live under `tests/tools/` and use `playwright.tools.config.ts`. The runner exits successfully when no tools are promoted yet.

## Promotion rule

A future tool must be added as one atomic promotion unit: manifest + runtime + route + browser regression. It is not considered public until the promotion evidence is complete and the tool is registered in `publicToolRegistrations`.

## Rollback

To roll back a promoted tool, remove its public registration and promotion unit. Do not delete legacy source. The `legacy-tools-archive` branch is the preservation point for the original repository state.

## Current baseline

The `clean-baseline` branch intentionally exposes **zero public tools**. That is a successful architecture state, not an incomplete product state.
