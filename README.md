# Flixo

Flixo is intentionally reset to a clean technical foundation.

## Current state

- Product tools: none.
- Public tool registry: none.
- Tool implementation folders: empty by design.
- Core app: minimal Vite + React + TanStack Router shell.
- Quality gates: typecheck, lint, production build, dependency audit, Playwright smoke test.

## Rule

No tool is added directly to production. A future tool must be introduced as an isolated feature, with its own route, tests, security review, and evidence before promotion.

## Commands

```bash
npm ci
npm run check
npm run test:e2e
npm run audit:production
```
