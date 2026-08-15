# Flixo Tools

Flixo is a multilingual, privacy-first browser tools platform built with TanStack Start, React, TypeScript, Vite, Tailwind CSS, and server-side AI integrations.

The project is organized around a canonical tool registry and real runtimes. Public discovery must never expose a tool that is only planned or placeholder code.

## Product principles

- Real execution over placeholder UI.
- Public search contains only capabilities that satisfy the runtime/release gates.
- Manual QA is separate from the user-facing star/rating feedback mechanism.
- Localization is a product capability and a release requirement, not a convenience translation layer.
- Browser-local processing is preferred when it improves privacy and reliability.
- AI failures are explicit; the system does not manufacture successful results.

## Stack

- TanStack Start / TanStack Router
- React 19 / TypeScript
- Vite 8 / Tailwind CSS
- Node.js 22
- Drizzle ORM / PostgreSQL
- Playwright for browser-level regression coverage

## Development

```sh
npm ci
npm run dev
```

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npx playwright test tests/chat.spec.ts
npm run test:desktop
npx playwright test tests/mega-tools.spec.ts
```

The CI workflow applies the same gates plus registry, runtime, SEO, localization, RTL, terminology, and dependency-contract validation.

## Tool lifecycle

`placeholder` → planning only

`planned` → roadmap only; not public runtime

`ready` → real runtime exists and is eligible for automated testing

Manual QA is tracked separately. User stars/ratings remain user feedback and never represent administrator QA approval.

## Architecture

- `src/data` — canonical tool/category/SEO data
- `src/lib/tool-runtime` — executable tool implementations
- `src/routes` — TanStack file-based routes
- `src/lib/ai` — AI orchestration and provider logic
- `src/lib/i18n` — locale dictionaries and localization contracts
- `src/lib/analytics` — privacy-first product analytics
- `src/lib/admin` — protected administration and survey/behavior tooling
- `tests` — browser-level regression coverage
- `scripts` — release and contract validators

See [`docs/ENGINEERING-ROADMAP.md`](docs/ENGINEERING-ROADMAP.md) for the production engineering roadmap and release gates.
