- [TanStack SSR hydration](tanstack-ssr-hydration.md) — request-scoped CSP values and route-derived render state must be deterministic across SSR and the first client render.
- [GitHub push authentication](github-push-auth.md) — use the managed GitHub push when the HTTPS shell remote lacks credentials.

## Verified baseline (2026-08-09)

- Branch `main` at `b901d92` ("feat: add text tools"), working tree clean,
  up to date with `origin/main`. Shallow clone.
- `npm run verify` passes fully **after** `npm install` (node_modules is NOT
  committed/present by default — install before verifying).
- Counts from validators: **212 registered tools, 73 ready, 123 runtimes**
  (50 runtimes exist for still-`planned` tools; route layer hides them via
  `renderReadyToolPage`'s status guard — this is intentional, not an error).
- Note: prior task briefs claimed "213 tools / 75 ready / Slug Generator added"
  but Slug Generator was **not** present in the codebase at this commit. The
  real baseline is 212/73. Treat user-supplied counts as aspirational; always
  re-derive from `npm run validate:registry` / `validate:tool-runtime`.
