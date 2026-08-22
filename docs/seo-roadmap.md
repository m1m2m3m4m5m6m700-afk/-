# FLIXO Technical SEO & Web Performance Roadmap

This document is the engineering contract for crawlability, canonicalization, multilingual discovery, structured data, accessibility, and Core Web Vitals.

## Current production constraint

The connected Vercel project currently has only Vercel-hosted domains. A custom production domain is not configured. FLIXO therefore refuses to emit production canonical, sitemap, or IndexNow URLs for `*.vercel.app` and `localhost`.

Set `VITE_SITE_URL` to the final HTTPS production origin before publishing SEO assets.

## Google-aligned targets

- LCP: good at <= 2.5s (internal stretch target: < 1.8s)
- INP: good at < 200ms
- CLS: good at < 0.1 (internal stretch target: 0)
- Absolute self-referencing canonical URLs
- Absolute sitemap URLs with no query parameters
- Reciprocal hreflang with `x-default`
- People-first content and truthful claims
- No IP/browser-language redirects
- HTTPS-only canonical and sitemap URLs

## Implemented in PR #126

- Shared canonical/alternate/JSON-LD metadata helpers
- EN/AR hreflang for the existing translated compressor pages
- Synchronized `html[lang]` and `html[dir]` on router navigation
- Early locale bootstrap before React hydration
- Root not-found handling and noindex client boundary
- Unavailable Photo Colorizer removed from the public route tree
- Localized Open Graph images (1200x630)
- Sitemap index + language sitemaps + robots generation
- Deterministic SEO asset validation
- Dedicated SEO workflow and crawlability E2E tests
- Optional IndexNow workflow gated on a real production origin and key

## Remaining product-level work

- Refactor heavy image processing and editor interactions into Web Workers where supported.
- Measure real-user CWV in field data; CI browser timings are regression tests, not proof of Search Console field status.
- Resolve duplicate/legacy image routes with a deliberate canonical/redirect policy.
- Configure the final HTTPS production domain and Search Console property.
- Add real localized content depth per tool instead of relying only on metadata.

## Rules

- Never fabricate reviews, ratings, offers, authorship, or product claims for structured data.
- Never use `noindex` on canonical indexable pages.
- Never use `robots.txt` as a substitute for canonicalization.
- Never publish a temporary Vercel URL as the production canonical origin.
