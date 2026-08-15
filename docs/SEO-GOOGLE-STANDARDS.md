# Flixo — Google Search & Multilingual Quality Standard

## Purpose

SEO is a product-quality requirement for Flixo, not a layer added after development. The goal is to make every public page useful to people first, technically understandable to Google Search, fast, accessible, trustworthy, and genuinely localized.

Meeting these standards does **not** guarantee rankings, indexing, rich results, or a specific position in Google Search. Google states that meeting Search Essentials is necessary for eligibility and can improve visibility, but ranking is determined by many systems and signals.

## Non-negotiable principles

1. **People-first content.** Every page must have a clear user purpose, provide substantial value, and avoid search-engine-first filler or mass-produced pages created only to attract queries.
2. **One language per localized page.** The visible primary content and navigation must be in the selected language. No silent English fallback.
3. **Full localization, not literal translation.** Each launch language has its own dictionary, glossary, UX copy, marketing copy, and SEO copy written naturally for that audience.
4. **Every public page has a stable URL.** Language variants use explicit locale paths such as `/ar/`, `/es/`, `/fr/`, etc. Do not rely on cookies or browser-only language switching for crawlable content.
5. **Localized variants are linked explicitly.** Every localized page must expose its alternate language equivalents and use correct `hreflang` annotations or an equivalent sitemap-based implementation.
6. **No automatic language redirect for crawlers/users.** A user can switch language explicitly; Google must be able to crawl each locale independently.
7. **Canonical discipline.** Each page has one intentional canonical URL. Duplicate or near-duplicate regional variants must not compete accidentally.
8. **Crawlable internal linking.** Important pages must be reachable through normal links, not only client-side interactions.
9. **Accurate structured data.** Structured data must describe the visible page content and follow Google's supported feature guidelines. Never mark up hidden, misleading, or fabricated information.
10. **Trust and transparency.** Claims, tool capabilities, privacy statements, and AI behavior must match what the product actually does.

## Multilingual launch model

A language is not considered production-ready until it has:

- a complete dictionary with the same key set as the source language;
- no `...en` inheritance used as production fallback;
- a language-specific glossary;
- native UX and marketing copy;
- localized tool names, descriptions, FAQs, metadata, and calls to action;
- localized SEO title and description strategy;
- correct `lang` and text direction (`ltr`/`rtl`);
- valid localized routes;
- reciprocal alternate-language links;
- valid `hreflang` coverage;
- no visible strings from another language caused by missing translations;
- localization validation and typecheck passing.

A language that fails any of these checks remains **incomplete** and must not be presented as a finished market experience.

## Search-quality requirements for every indexable page

### Content

- Clear primary topic and search intent.
- Original, useful information rather than generic boilerplate.
- Descriptive page title and one clear primary heading.
- Helpful body content explaining what the tool does, how it works, limitations, privacy/processing behavior, and practical use cases where appropriate.
- Real examples where they improve user understanding.
- No keyword stuffing, hidden text, misleading claims, or doorway pages.

### Metadata

- Unique, language-appropriate `<title>`.
- Unique, useful meta description when appropriate.
- Correct canonical URL.
- Open Graph/Twitter-style sharing metadata where supported by the site.
- Correct localized URL and alternate-language references.

### Images and media

- Descriptive `alt` text when the image conveys information.
- Decorative images remain decorative.
- Efficient image formats and responsive sizing.
- Media should add user value rather than exist only for SEO.

### Performance and experience

- Mobile-first responsive behavior.
- Fast initial rendering and efficient JavaScript.
- Avoid unnecessary layout shift and long blocking work.
- Keep interactions responsive and lightweight.
- Monitor Core Web Vitals and real-user performance where possible.
- Maintain secure HTTPS delivery.

### Accessibility

- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Accessible names for controls.
- Correct heading structure.
- Direction-aware layouts for RTL languages.

## Flixo-specific SEO architecture

### Tool pages

Every tool page should communicate:

- what the tool does;
- who it is for;
- supported inputs/outputs;
- whether processing is local, server-side, or AI-assisted;
- important limitations;
- practical examples or use cases;
- related tools;
- relevant FAQ content;
- last-updated/version information when applicable.

Tool content must never claim a feature that the runtime does not actually provide.

### Tool discovery

The home page prioritizes the general Flex assistant and compact tool hubs. The complete tool catalog remains discoverable lower on the page and through crawlable category/tool links. This supports both usability and crawlability without turning the first screen into a giant catalog.

### AI-generated content

AI may assist with drafting, localization, or product workflows, but published pages must be reviewed for accuracy, originality, usefulness, and language quality. Do not generate large numbers of low-value pages merely to capture search traffic.

## Automated gates

The repository should treat the following as release blockers for indexable localized pages:

- missing translation keys;
- English fallback in a strict production locale;
- broken interpolation placeholders;
- invalid locale routes;
- missing canonical metadata;
- broken reciprocal alternate-language references;
- missing required tool content fields;
- incorrect structured-data claims;
- typecheck/build failures.

Existing validation scripts should be extended rather than bypassed.

## Google-aligned reference sources

These standards are based primarily on Google Search Central guidance:

- Search Essentials: https://developers.google.com/search/docs/essentials
- Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Managing multilingual and multi-regional sites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Localized versions and `hreflang`: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search and multilingual queries: https://developers.google.com/search/blog/2023/09/multilingual-searches

Last reviewed: 2026-08-15.
