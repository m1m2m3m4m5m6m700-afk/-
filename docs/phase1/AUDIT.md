# FLIXO Phase 1 — Baseline and Canonical Tool System Audit

## Scope

This audit is intentionally limited to reliability, canonical tool definition, lifecycle/release gates, generator foundation, and tool-quality contracts. No UX migration, dynamic-route migration, performance refactor, AI refactor, analytics refactor, database refactor, or mass deletion is part of this phase.

## 1. Current architecture

- App: TanStack Start + Vite + React + TypeScript.
- Routing: file-based `src/routes`; `src/routes/README.md` is the routing contract. `routeTree.gen.ts` is generated and must not be edited manually.
- Canonical product catalog: `src/data/tools.ts`.
- Category catalog: `src/data/categories.ts`.
- Ready runtime registry: `src/lib/tool-runtime/readyTools.ts` with runtime modules under `src/lib/tool-runtime/tools/`.
- Runtime contract: `src/lib/tool-runtime/types.ts`.
- Generic preset execution: `src/data/megaToolsCatalog.ts` + `src/lib/megaToolsEngine.ts`.
- AI: `src/lib/ai/` plus existing chat/provider/server layers.
- SEO: `src/data/toolSeo.ts`, `src/data/toolContent.ts`, and existing SEO validators/generator scripts.
- i18n: existing `src/lib/i18n/` plus localization validators and route-locale structure.
- Analytics/admin: existing `src/lib/analytics`, `src/lib/admin`, and related routes; unchanged in this phase.
- Security: existing security contract/validator and server-side secret guards; unchanged in this phase.
- Database: existing `src/lib/db`/Drizzle stack; unchanged in this phase.
- Testing: npm validation scripts + TypeScript + ESLint + Playwright suites.

## 2. Canonical source of truth

`src/data/tools.ts` remains the canonical public tool catalog. It owns stable tool identity (`id`), URL identity (`slug`), category membership, product description, and current catalog status.

`src/lib/tool-runtime/readyTools.ts` remains the canonical runtime registry. Runtime implementation files remain under `src/lib/tool-runtime/tools/`.

`src/data/megaToolsCatalog.ts` is a derived operational catalog. Its `PRESETS` and handler matrix are execution modes, not independent product identities.

`src/routes/` remains the canonical URL source. No route migration was performed.

## 3. Tool / preset / feature / mode / workspace / route model

- Tool: product-level capability with stable `id` and public `slug`.
- Preset: bounded execution configuration such as `quick`, `web`, `pro`, or `max`; not a new canonical tool id.
- Feature: supporting capability used by a tool or workspace; not automatically a public tool.
- Mode: runtime behavior/variant; may be implemented by a shared handler.
- Workspace: product surface that can host multiple tools/features; not a tool identity.
- Route: URL surface; not the canonical identity and must remain backward-compatible.

## 4. Duplication map

| Group | Decision | Reason |
|---|---|---|
| `src/data/tools.ts` tool entries | KEEP | Canonical product/catalog identity and backward-compatible IDs/slugs already consumed across categories, SEO and routes. |
| `readyToolRuntimes` + per-tool runtime modules | KEEP | Existing runtime system is coherent and already validated by CI; creating a second runtime registry would duplicate infrastructure. |
| `MEGA_TOOLS` handler × preset matrix | KEEP as derived catalog | It represents shared execution logic plus presets, not separate product identities. |
| Specific public tools that overlap a mega handler (for example image compression) | KEEP for now | Public tool UX/route identity must remain stable; sharing execution does not prove the public entries are safe to merge. |
| `quick/small/medium/.../max` | CONVERT TO PRESET conceptually | These are already encoded as presets and must never become separate canonical tool IDs. |
| Existing bulk `scripts/generate-all-50-tools.mjs` | KEEP as batch/legacy utility | It is an existing bulk script. It should not become the single-tool canonical generator; no deletion was performed. |
| Duplicate routes | NO SAFE DEPRECATION IDENTIFIED IN THIS AUDIT | Route equivalence was not established strongly enough to justify deletion, so no route deletion was made. |

No merge or deletion is performed in Phase 1 because this audit intentionally separates identification from destructive migration.

## 5. Lifecycle and release policy

The existing `src/lib/tool-quality/contract.ts` is extended, not replaced. The canonical lifecycle is:

`planned → ready → automated_pass → manual_pass → public`

Failure/exception states:

`failed`, `blocked`, `deprecated`

A tool is publishable only when runtime readiness, manual review, searchable/public-surface policy, and all release gates pass. `public` is therefore a result of gates, not a substitute for them.

Release gates:

1. Registry
2. Runtime
3. Automated tests
4. Manual review
5. Localization
6. SEO
7. Accessibility
8. Security
9. Performance

The code contract already represented these dimensions; Phase 1 makes the lifecycle and gate model explicit and reusable.

## 6. Reliability baseline

The most recent `main` CI run before Phase 1 was green through integration, dependency validation, registry, runtime, quality, AI, accessibility, security, SEO, localization, build, generated route tree, and typecheck. It failed at lint on `src/lib/ai/chat/handler.ts` because ESLint reported an unexpected control character in a regular expression.

The browser-test stages were consequently skipped in that run.

Phase 1 fixes the actual source expression instead of ignoring or disabling the lint rule.

Existing scripts already provide the full pipeline, so no duplicate `check:full`/`check:release` aliases were added. `test` remains the full suite and `verify` remains the full suite plus production dependency audit. A single `check:fast` alias was added for the explicit typecheck + lint fast gate.

## 7. Generator policy

Official single-tool entrypoint:

`npm run generate:tool -- <slug> [--category <id>] [--runtime browser|server|hybrid>] [--name <name>]`

The generator:

- reads the existing canonical registry and category catalog;
- rejects duplicate IDs;
- rejects duplicate slugs;
- rejects duplicate route candidates;
- rejects invalid/missing categories;
- rejects invalid runtime kinds;
- generates Definition, Runtime scaffold, Validator scaffold, Tests scaffold, SEO, i18n, and Docs;
- never registers the tool automatically;
- never changes readiness/publication automatically;
- never creates `src/tools/`.

Generated scaffolds live under `docs/tool-scaffolds/<slug>/` until the implementation is real and reviewed, preventing accidental public registration.

## 8. Git safety / rollback

Checkpoint branch created from the exact `main` SHA observed before edits:

`phase1-reliability-tool-foundation`

Base SHA:

`81ef5ddb834353472c0c86b9ba708057b31389ba`

No mass deletion was performed. Expected modified files are limited to the Phase 1 contract/CI/package/AI lint fix and new generator/validator/docs files. Rollback is a branch reset or branch deletion before merge; `main` remains untouched by this Phase 1 branch.

## 9. Expected changed files

- `src/lib/ai/chat/handler.ts`
- `src/lib/tool-quality/contract.ts`
- `src/scripts/validate-tool-contract.mjs`
- `scripts/generate-tool.mjs`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/phase1/AUDIT.md`

No files are deleted.
