# Flixo Engineering Roadmap

## Objective

Make Flixo a production-grade, multilingual, privacy-first tools platform where a capability is public only after it has a real runtime, automated verification, localization coverage, and manual QA.

## Release gates

A public tool must satisfy:

1. `ready` runtime exists and is reachable through the canonical registry.
2. Automated runtime/output tests pass.
3. TypeScript and lint pass.
4. Localization dictionary and page contracts pass for every supported locale.
5. SEO metadata and route validation pass.
6. Accessibility checks pass for interactive surfaces.
7. Manual QA is recorded separately from the public user rating/star system.
8. Regression status is clean before promotion to featured/public discovery.

## Engineering workstreams

### P0 — Reliability

- Keep `npm ci` frozen and reproducible. Lockfile drift is an error, not something the CI job silently commits.
- Make the production deployment depend on a successful CI workflow run.
- Split dependency validation, static validation, typecheck/lint, build, and browser tests into diagnosable gates.
- Keep Vercel deployment disabled while Vercel rate limiting is active; re-enable only behind the CI-success gate.

### P1 — Tool quality

- Formalize tool lifecycle: `placeholder`, `planned`, `ready`, `reviewed`, `failed`, `deprecated`.
- Track automated QA separately from manual QA.
- Record regression evidence for every reviewed tool.
- Keep planned tools out of public search/discovery.
- Add zero-result search intelligence so missing demand becomes roadmap input.

### P1 — AI / Flex

- Separate conversation, intent detection, tool discovery, web research, and tool execution.
- Add provider health, timeout, fallback, and circuit-breaker policies.
- Never return synthetic success when the requested capability was not executed.

### P1 — Analytics

Track the privacy-safe funnel:

`landing → search → category → tool → start → complete → download`

Measure zero-result searches, tool failure rate, completion rate, time-to-result, language conversion, and return sessions.

### P1 — Localization

- Keep strict dictionary enforcement for all non-English locales.
- Detect missing keys, English leakage, terminology drift, RTL regressions, and route-level locale gaps.
- Treat localization quality as a release gate, not a post-release translation task.

### P2 — SEO

Every public tool should have a locale-aware landing page with canonical metadata, hreflang, structured data, breadcrumbs, FAQ where justified, and related-tool navigation.

### P2 — Security and accessibility

- Keep security headers and input validation centralized.
- Enforce file size/MIME limits and object-URL lifecycle cleanup.
- Add keyboard, focus, semantics, contrast, and reduced-motion checks for public interactive surfaces.

### P2 — Product growth

- Add feature flags for beta/experimental tools.
- Add tool health scores before featuring tools.
- Build competitive coverage by category without exposing unimplemented tools.

## Non-negotiable rule

Do not solve CI failures by suppressing checks, adding `any`, ignoring serialization errors, or relabeling a broken tool as ready.
