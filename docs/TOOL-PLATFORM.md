# Tool Platform Engineering Rules

## Ownership

- `src/lib/tool-platform/` owns tool identity, lifecycle, public registration, and test contracts.
- `src/lib/tool-runtime/` owns React implementations and runtime bindings only.
- `src/data/tools.ts` is legacy/catalog data and must not be imported by runtime contracts.

## Promotion

A tool progresses in one direction: `draft -> implemented -> verified -> public`. A tool may become `deprecated` from any non-deprecated state.

Public registration requires a manifest, a matching route contract, and non-empty regression checks.

## Safety invariants

- Public runtime IDs must have exactly one platform registration.
- Manifest ID, slug, category, and runtime binding must match.
- Public routes must resolve only from the public runtime registry.
- Legacy catalog status must never grant public access.
