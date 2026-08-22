# FLIXO Error Memory

Current-architecture record of verified failures and permanent prevention. Only repository/application or diagnostic-tool defects are listed as incidents; external constraints and architectural review findings are recorded separately.

## Rules
- Record only verified root causes; never record a hypothesis as a failure.
- Keep repository/application and diagnostic-tool defects separate from external-service capacity and configuration constraints.
- Every incident must state a durable prevention mechanism and traceable evidence reference.
- Legacy diagnostic PRs are historical references, not runtime dependencies.
- Do not reuse a signature for a different root cause.
- Do not classify configuration constraints or review findings as runtime failures.

## Verified incidents

| Signature | Root cause | Durable fix | Class | Evidence |
|---|---|---|---|---|
| `INVALID_WORKFLOW_YAML_SOCKET_ECHO` | A GitHub Actions `run:` value used a YAML plain scalar containing `:` followed by a space | Quote the complete scalar value and keep workflow syntax validation in CI | CI/code | CI: `#1506`; commit: `dfaea459` |
| `SITEMAP_XML_QUERY_FALSE_POSITIVE` | The sitemap validator scanned the XML declaration instead of only `<loc>` URL values | Parse/validate `<loc>` entries only; ignore XML declaration syntax | SEO/test | PR: `#126`; failure: sitemap validation |
| `DUPLICATE_LOCALIZED_ROUTE` | Generic localized routes duplicated the dedicated EN/AR compressor routes | Exclude special routes from the generic matrix and assert the final route count | architecture | PR: `#126`; failure: route-matrix E2E |
| `UNAVAILABLE_TOOL_200` | SPA fallback exposed an unavailable tool as HTTP 200 | Return HTTP 404 and attach `noindex,follow` for unavailable/missing tools | SEO/runtime | PR: `#126`; failure: crawlability E2E |
| `INVALID_RADIX_RANGE` | A change introduced a dependency range that was not present in the package registry | Keep the package/lockfile baseline exact unless a verified upgrade is tested end-to-end | dependency | PR: `#126`; failure: `npm ci` |
| `HARD_CODED_TOOL_UI_TEXT` | User-visible JSX bypassed the locale dictionaries | Typed tool UI dictionaries plus AST `i18n:check` gate | i18n | PR: `#126`; failure: i18n gate |
| `UNINTENDED_DEPENDENCY_EDIT` | A tooling edit accidentally changed an unrelated dependency version while adding a script | Compare dependency manifests against `main` and reject unrelated package drift | process/dependency | PR: `#126`; correction commit: `b35d84bf` |
| `MANIFEST_LOCKFILE_RANGE_DRIFT` | Dependency ranges in `package.json` diverged from the lockfile after tooling edits, preventing a deterministic dependency audit | Require exact manifest/lockfile range agreement and fail diagnostics on range mismatch before build/test execution | process/dependency | CI Diagnostics `#14`; failure: dependency-drift; correction commit: `d76a1ea1` |
| `STALE_DIAGNOSTIC_ROUTE_PATH` | The tool-contract diagnostic hard-coded a route-matrix filename that no longer exists in the current route architecture | Resolve and validate the authoritative current route module (`src/routes/localized-tool-routes.tsx`) instead of a legacy filename | diagnostics/tooling | CI Diagnostics `#14`; failure: tool-contract; correction commit: `f45d6168` |

## Verified external constraints

These are real constraints observed during the work, but they are **not application failures** and must not be counted as regression incidents:

| Constraint | Impact | Required handling | Evidence |
|---|---|---|---|
| `VERCEL_BUILD_RATE_LIMIT` | Vercel Hobby deployment capacity was exhausted during repeated preview builds | Treat as external capacity; avoid redeploy loops and do not classify it as an application-code failure | PR: `#126`; provider: Vercel; failure: build-rate-limit |
| `CANONICAL_ORIGIN_UNAVAILABLE` | No final HTTPS production domain is configured; only temporary Vercel domains exist | Refuse production canonical/sitemap output until `VITE_SITE_URL` is a real HTTPS origin | PR: `#126`; provider: Vercel |

## Architectural review findings

These findings are useful engineering knowledge but were not recorded as verified production failures:

| Finding | Prevention | Evidence class |
|---|---|---|
| `INEFFECTIVE_LOCALE_DYNAMIC_IMPORT` | Keep compile-time locale typing separate from runtime locale chunks | PR: `#126`; review: locale-loader |

## Error-memory contract

A memory entry is actionable only when it contains a unique signature, verified root cause, durable prevention, classification, and traceable evidence. The validator enforces uniqueness, structure, incident/constraint separation, and evidence-reference format, but the presence of a record does not prove that the underlying incident can never recur.

## Legacy evidence

PR #112 established evidence-first error capture and PR #113 established governed regression knowledge. Those branches target an older architecture and are not merged blindly into the current Foundation. Their useful policy is represented here instead.
