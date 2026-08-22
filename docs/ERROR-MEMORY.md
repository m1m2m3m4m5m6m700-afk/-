# FLIXO Error Memory

Current-architecture record of verified failures and their permanent fixes.

## Rules
- Record only verified root causes.
- Distinguish code defects from external service failures.
- Every blocking entry must name the durable prevention mechanism.
- Legacy diagnostic PRs are historical evidence, not runtime dependencies.

## Verified incidents

| Signature | Root cause | Durable fix | Class |
|---|---|---|---|
| `INVALID_WORKFLOW_YAML_SOCKET_ECHO` | YAML plain scalar contained `:` followed by a space | Quote the full `run:` value | code |
| `SITEMAP_XML_QUERY_FALSE_POSITIVE` | Validator scanned the XML declaration for `?` | Validate `<loc>` URLs only | code |
| `DUPLICATE_LOCALIZED_ROUTE` | Generic localized route duplicated a special compressor route | Special routes are excluded from the generic matrix and total is asserted | architecture |
| `UNAVAILABLE_TOOL_200` | SPA fallback served unavailable tools as HTTP 200 | Unavailable tools return 404 + `noindex,follow` | SEO/runtime |
| `INVALID_RADIX_RANGE` | A branch introduced a non-existent dependency range | Preserve exact lockfile/package baseline unless a verified upgrade exists | dependency |
| `HARD_CODED_TOOL_UI_TEXT` | User-visible JSX strings bypassed locale dictionaries | Typed tool UI dictionaries + AST `i18n:check` | i18n |
| `VERCEL_BUILD_RATE_LIMIT` | Vercel Hobby build limit exhausted | Treat as external deployment capacity, not an application failure; avoid repeated redeploy loops | external |
| `INEFFECTIVE_LOCALE_DYNAMIC_IMPORT` | Locale modules were both statically and dynamically imported | Keep locale catalog typing separate from runtime loader chunks | performance |

## Legacy evidence

PR #112 established evidence-first error capture and PR #113 established governed regression knowledge. Those branches target an older architecture and are not merged blindly into the current Foundation. Their useful policy is represented here instead.
