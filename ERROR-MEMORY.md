# FLIXO Error Memory

Central index for recurring CI, runtime, hydration, route, and E2E failures.

## Correlation contract

- Client diagnostics persist `traceId` with route, stack, and component stack.
- API requests use `x-flixo-trace-id` and echo it in error responses.
- Playwright retains trace, screenshot, and video on failure.
- CI diagnostic summary records failed job states and links the exact commit/run.

## Known resolved classes

### Route-tree hydration mismatch
Use the generated TanStack route tree as the only runtime route source. Virtual route implementation files must be excluded from normal file-route scanning.

### Playwright strict-mode collisions
Scope repeated UI text to its semantic result container or prefer accessible roles/names.

### Arabic intent matching
Normalize Arabic diacritics, hamza variants, taa marbuta/yaa variants, and common attached prefixes before matching.

## Automatic updates

`node scripts/record-ci-error-memory.mjs` appends a CI failure entry when the diagnostic summary detects a failed gate.
