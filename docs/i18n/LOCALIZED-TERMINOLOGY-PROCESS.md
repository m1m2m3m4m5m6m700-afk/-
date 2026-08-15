# Flixo — Native Terminology Research Process

## Why this exists

Flixo uses multilingual content as a user-acquisition channel. A locale is therefore not a literal translation of English. Every visible term must be natural for a native user and appropriate for the product domain.

## Rule for every production language

For each production locale, recurring interface terms are maintained in:

- `src/lib/i18n/locales/<locale>.ts` — complete visible UI dictionary.
- `src/lib/i18n/glossary.ts` — recurring product/technical concepts.
- Locale-specific SEO copy — titles, descriptions, headings, calls to action, and tool descriptions.
- A research record maintained by the localization owner/agent.

The glossary controls consistency; it does not mechanically rewrite prose.

## Native-language research method

Before a locale is promoted to production, terminology is checked against real usage in that language. Priority order:

1. Official terminology bodies, standards, government terminology resources, and major platform documentation in the target language.
2. Major software/product documentation used by native speakers (for example Adobe, Microsoft, Google, Apple, or established developer documentation in the target language).
3. Current native UX/product pages and search-result language used by established products in the same category.
4. Native-speaker editorial review for fluency, naturalness, and regional fit.

Do **not** choose a term merely because it is a literal dictionary translation. When two terms are common, prefer the one that is clearer for the target market and consistent with the surrounding product vocabulary.

## Search and SEO rule

Research is for choosing natural visible language and query wording. It is **not** a license to stuff keyword lists into pages. Google Search does not use the `meta keywords` tag for ranking, so Flixo should focus on natural language in visible content, titles, descriptions, headings, and useful page copy. See Google Search Central documentation on unsupported tags and multilingual sites.

## Current 10-language launch set

The first production-quality set is:

- `ar` Arabic
- `en` English
- `es` Spanish
- `fr` French
- `de` German
- `pt` Portuguese
- `zh-CN` Simplified Chinese
- `hi` Hindi
- `ja` Japanese
- `ko` Korean

Other locale files remain in the repository for future expansion but are not considered marketing-complete until they pass the same process.

## Evidence examples already checked

- Arabic UI/product terminology is checked against current Arabic product documentation, including established terminology for PDF actions such as search/replace, rotate, compress, password protection, and OCR. Adobe's Arabic documentation is a useful product-language reference.
- French AI terminology is checked against the French Ministry of Culture / DGLFLF's official 2025 collection of recommended AI terms and the French Journal Officiel terminology list.
- Italian AI terminology is checked against INAPP's 2025 AI glossary.
- Japanese terminology can additionally be checked against established translation/technical glossaries published by Japanese-language industry organizations such as AAMT.

These sources are used as terminology evidence, not as page-copy templates.

## Release gate

A locale cannot be called complete when any of the following is true:

- a visible phrase is missing from the locale dictionary;
- the locale silently inherits English in production;
- a recurring concept uses inconsistent terms without an intentional reason;
- SEO title/description is still an English template;
- the main page is only a literal translation rather than native copy;
- the tool page exposes English UI text in the localized route.

The localization validator and CI are release gates. A new language is promoted only after its dictionary, glossary, localized SEO, route, and page-content checks pass together.
