# Tool Platform

The Tool Platform is the only new source of truth for runtime-facing tool contracts.

Legacy catalog data under `src/data/tools.ts` remains available for compatibility, content, and roadmap validation. Runtime code must not import its `Tool` type.

## Layers

- `types.ts`: stable platform contracts and lifecycle states.
- `registry/`: public registrations.
- `promotion/`: rules that move a tool toward public availability.
- `testing/`: per-tool regression contracts.

A tool becomes public only after its manifest, runtime, route, and regression contract are all present and verified.
