# FLIXO Universal Error Sink

This layer provides evidence-first capture for deterministic CLI/development failures.

## Contracts

- `scripts/error-sink.mjs` records a bounded structured error history in `errors.log.json` and appends an auditable entry to `DECISION_LOG.md`.
- The recorded SHA is captured from the process working tree and may be overridden by a verified caller.
- Sensitive provider key patterns and bearer tokens are redacted before persistence.
- Error persistence is best-effort and must not become a runtime single point of failure.
- JSON writes use an exclusive lock plus a unique temporary filename and atomic rename.
- `scripts/run-with-sink.mjs` forwards child stdout/stderr and records non-zero exits without using `shell: true`.

## Evidence-first rule

The sink records evidence; it does not diagnose or invent root causes. A missing signature remains `UNVERIFIED` to the repair engine.

## Current integration boundary

The safe foundation is implemented independently of the existing AI/RPC runtime. Package-script wrapping and browser-runtime reporting are intentionally not changed in this patch because the repository's current route/server boundary must be verified first; adding an ad-hoc `/api/log-error` endpoint would create an unreviewed network write surface.

Use the CLI wrapper explicitly for deterministic local commands while the integration boundary is reviewed:

```text
node scripts/run-with-sink.mjs <executable> <arg> ...
```

Examples:

```text
node scripts/run-with-sink.mjs npm run verify:strict
node scripts/run-with-sink.mjs npx tsc --noEmit
node scripts/run-with-sink.mjs npx playwright test
```
