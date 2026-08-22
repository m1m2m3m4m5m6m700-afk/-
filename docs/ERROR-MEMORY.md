# FLIXO Error Memory

Current-architecture record of verified failures and permanent prevention. Only incidents with direct evidence are listed as failures; architectural reviews and environment constraints are recorded separately.

## Rules
- Record only verified root causes; never record a hypothesis as a failure.
- Distinguish repository defects from external-service capacity failures.
- Every incident must state a durable prevention mechanism and traceable evidence reference.
- Legacy diagnostic PRs are historical references, not runtime dependencies.
- Do not reuse a signature for a different root cause.
- Do not classify configuration constraints or review findings as runtime failures.

## Verified incidents

| Signature | Root cause | Durable fix | Class | Evidence |
|---|---|---|---|---|
| `INVALID_WORKFLOW_YAML_SOCKET_ECHO` | A GitHub Actions `run:` value used a YAML plain scalar containing `:` followed by a space | Quote the complete scalar value and keep workflow syntax validation in CI | CI/code | GitHub Action: `#1506`; commit: `dfaea459` |
| `SITEMAP_XML_QUERY_FALSE_POSITIVE` | The sitemap validator scanned the XML declaration instead of only `<loc>` URL values | Parse/validate `<loc>` entries only; ignore XML declaration syntax | SEO/test | PR: `#126`; failure: sitemap validation |
| `DUPLICATE_LOCALIZED_ROUTE` | Generic localized routes duplicated the dedicated EN/AR compressor routes | Exclude special routes from the generic matrix and assert the final route count | architecture | PR: `#126`; failure: route-matrix E2E |
| `UNAVAILABLE_TOOL_200` | SPA fallback exposed an unavailable tool as HTTP 200 | Return HTTP 404 and attach `noindex,follow` for unavailable/missing tools | SEO/runtime | PR: `#126`; failure: crawlability E2E |
| `INVALID_RADIX_RANGE` | A change introduced a dependency range that was not present in the package registry | Keep the package/lockfile baseline exact unless a verified upgrade is tested end-to-end | dependency | PR: `#126`; failure: `npm ci` |
| `HARD_CODED_TOOL_UI_TEXT` | User-visible JSX bypassed the locale dictionaries | Typed tool UI dictionaries plus AST `i18n:check` gate | i18n | PR: `#126`; failure: i18n gate |
| `VERCEL_BUILD_RATE_LIMIT` | Vercel Hobby deployment capacity was exhausted during repeated preview builds | Treat this as external capacity; avoid redeploy loops and do not classify it as an application-code failure | external | PR: `#126`; provider: Vercel; failure: build-rate-limit |
| `UNINTENDED_DEPENDENCY_EDIT` | A tooling edit accidentally changed an unrelated dependency version while adding a script | Compare dependency manifests against `main` and reject unrelated package drift | process/dependency | PR: `#126`; correction commit: `b35d84bf` |

## Verified external constraints

These are real constraints observed during the work, but they are **not application failures** and must not be counted as regression incidents:

| Constraint | Impact | Required handling | Evidence |
|---|---|---|---|
| `CANONICAL_ORIGIN_UNAVAILABLE` | No final HTTPS production domain is configured; only temporary Vercel domains exist | Refuse production canonical/sitemap output until `VITE_SITE_URL` is a real HTTPS origin | PR: `#126`; provider: Vercel |

## Architectural review findings

These findings are useful engineering knowledge but were not recorded as verified production failures:

| Finding | Prevention | Evidence class |
|---|---|---|
| `INEFFECTIVE_LOCALE_DYNAMIC_IMPORT` | Keep compile-time locale typing separate from runtime locale chunks | PR: `#126`; review: locale-loader |

## Error-memory contract

A memory entry is actionable only when it contains a unique signature, verified root cause, durable prevention, classification, and traceable evidence. The validator enforces uniqueness, structure, and evidence-reference format, but the presence of a record does not prove that the underlying incident can never recur.

## Legacy evidence

PR #112 established evidence-first error capture and PR #113 established governed regression knowledge. Those branches target an older architecture and are not merged blindly into the current Foundation. Their useful policy is represented here instead.
