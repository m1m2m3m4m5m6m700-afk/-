# Flixo Production Checklist

This is the release contract. A release is not production-ready until every required gate is green.

## Reliability

- `npm ci` succeeds from a clean checkout.
- Dependency manifest and lockfile are identical at the root contract level.
- Production dependency audit has no high/critical blocking findings.
- Build and generated route tree validate successfully.

## Tool quality

- Public catalog contains only runtime-ready tools.
- Manual review is recorded separately from user ratings.
- Tool runtime/output tests are green.
- Regression evidence exists before a tool is promoted or featured.

## Localization

- Every supported locale has its own dictionary.
- Missing keys and English leakage are zero.
- Locale route and `<html lang>/<html dir>` contracts pass.
- Terminology profiles pass.

## Accessibility

- Public routes pass keyboard/focus checks.
- Interactive controls expose accessible names.
- No horizontal overflow at the tested viewport.
- RTL/LTR direction is applied at the document root.

## Security

- CSRF verification is enabled for mutating RPCs.
- Same-origin protection is enabled on sensitive HTTP endpoints.
- CSP/security headers are applied to SSR and API responses.
- Development host allow-list is explicit.
- File inputs enforce type/size and object-URL lifecycle rules.

## AI

- Provider credentials stay server-side.
- Provider failures produce truthful errors rather than synthetic success.
- Timeouts/rate limits are bounded.
- Flex tool discovery and web research are independently feature-flagged.

## Analytics

- Search results record result counts for zero-result intelligence.
- Tool lifecycle events expose start/complete boundaries.
- Admin paths are excluded from public analytics.
- User query text is not sent to first-party search analytics; hashed identifiers are used.

## Deployment

- Production deployment is triggered only after a successful CI run on `main`.
- Vercel deployment must return a valid production URL.
- Vercel rate limiting is treated as an infrastructure blocker, not a code success.
