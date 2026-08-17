# Tool Development Architecture

## Goal

The repository is maintained in two layers:

- **Legacy layer:** existing tool source, routes, data, and tests. Never delete these files merely to make the new system green.
- **Public layer:** only explicitly promoted runtimes are available to users.

## Public entry point

`src/lib/tool-runtime/readyTools.ts` is the single public runtime registry.

A tool is not public because it appears in `src/data/tools.ts`, because a route file exists, or because an old runtime exists in `src/lib/tool-runtime/tools/`.

A tool becomes public only when its runtime is explicitly imported and registered in `readyToolRuntimes`.

## Promotion requirements

A future tool promotion must provide:

1. A real runtime implementation.
2. A matching public route.
3. A verified catalog entry.
4. A browser regression test for the real user flow.
5. Passing `validate:tool-runtime`.
6. Passing typecheck, lint, and build.

## Isolation rule

Legacy runtimes are intentionally ignored by the public runtime validator until promoted. This prevents old or dead tools from blocking development of new tools.

## Rollback

The legacy source remains intact. To revert a promotion, remove only the promoted runtime/catalog/route registration from the new layer; do not delete the legacy implementation.

## Current baseline

The `clean-baseline` branch intentionally exposes **zero public tools**. This is expected. It is the stable technical foundation on which tools are promoted one at a time.
