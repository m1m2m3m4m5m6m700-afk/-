# FLIXO Error Memory

Current-architecture record of verified failures and permanent prevention. This document records failures that were actually observed during the current Foundation/i18n/SEO work; historical diagnostic PRs are evidence only.

## Rules
- Record only verified root causes; never record a hypothesis as a failure.
- Distinguish repository defects from external-service capacity failures.
- Every entry must state a durable prevention mechanism and evidence class.
- Legacy diagnostic PRs are historical references, not runtime dependencies.
- Do not reuse a signature for a different root cause.

## Verified incidents

| Signature | Root cause | Durable fix | Class | Evidence |
|---|---|---|---|---|
| `INVALID_WORKFLOW_YAML_SOCKET_ECHO` | A GitHub Actions `run:` value used a YAML plain scalar containing `:` followed by a space | Quote the complete scalar value and keep workflow syntax validation in CI | CI/code | CI #1506 / commit `dfaea459` |
| `SITEMAP_XML_QUERY_FALSE_POSITIVE` | The sitemap validator scanned the XML declaration instead of only `<loc>` URL values | Parse/validate `<loc>` entries only; ignore XML declaration syntax | SEO/test | SEO validation failure reproduced on PR #126 |
| `DUPLICATE_LOCALIZED_ROUTE` | Generic localized routes duplicated the dedicated EN/AR compressor routes | Exclude special routes from the generic matrix and assert the final route count | architecture | PR #126 route-matrix E2E |
| `UNAVAILABLE_TOOL_200` | SPA fallback exposed an unavailable tool as HTTP 200 | Return HTTP 404 and attach `noindex,follow` for unavailable/missing tools | SEO/runtime | PR #126 crawlability E2E |
| `INVALID_RADIX_RANGE` | A change introduced a dependency range that was not present in the package registry | Keep the package/lockfile baseline exact unless a verified upgrade is tested end-to-end | dependency | PR #126 `npm ci` failure |
| `HARD_CODED_TOOL_UI_TEXT` | User-visible JSX bypassed the locale dictionaries | Typed tool UI dictionaries plus AST `i18n:check` gate | i18n | PR #126 i18n gate |
| `VERCEL_BUILD_RATE_LIMIT` | Vercel Hobby deployment capacity was exhausted during repeated preview builds | Treat this as external capacity; avoid redeploy loops and do not classify it as an application-code failure | external | Vercel preview failures on PR #126 |
| `INEFFECTIVE_LOCALE_DYNAMIC_IMPORT` | Locale catalog typing caused locale modules to be pulled into static code paths as well as dynamic loading | Keep compile-time locale typing separate from runtime locale chunks | performance | PR #126 locale-loader review |
| `UNINTENDED_DEPENDENCY_EDIT` | A tooling edit accidentally changed an unrelated dependency version while adding a script | Compare dependency manifests against `main` and reject unrelated package drift | process/dependency | PR #126 package baseline correction |
| `CANONICAL_ORIGIN_UNAVAILABLE` | No final HTTPS production domain is configured; only temporary Vercel domains exist | Refuse production canonical/sitemap output until `VITE_SITE_URL` is a real HTTPS origin | external/config | PR #126 Vercel project state |

## Error-memory contract

A memory entry is actionable only when it contains: a unique signature, a verified root cause, a durable prevention mechanism, a class, and evidence. The validator enforces uniqueness and structure, but does not treat the memory as proof that the underlying incident can never recur.

## Legacy evidence

PR #112 established evidence-first error capture and PR #113 established governed regression knowledge. Those branches target an older architecture and are not merged blindly into the current Foundation. Their useful policy is represented here instead.
