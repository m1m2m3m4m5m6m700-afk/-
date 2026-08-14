# Flixo Localization Engine

## Canonical model

English (`en`) is the source of truth. Every non-English locale is a versioned representation of the same canonical content entity.

- Canonical entity IDs are language-neutral.
- Locale content never creates a second tool/entity.
- Source changes invalidate only the affected localized keys.
- Translation memory and glossary rules are shared across all locales.
- Search-intent and colloquial variants map back to the same canonical entity.
- Localized pages keep self-canonical URLs and are connected with `hreflang`.

## Layers

1. Canonical content: tool/category/page facts and English source strings.
2. Localization: locale-specific approved strings derived from the English source version.
3. Terminology: protected Flixo/technical terms and locale-specific preferred terms.
4. Search intent: formal terms, synonyms, questions, colloquial/dialect variants and safe misspellings mapped to canonical entities.
5. SEO representation: localized title, description, headings, structured content, canonical URL and `hreflang` cluster.
6. QA: placeholder preservation, terminology consistency, numeric/unit preservation, required-key coverage and stale-source detection.

## Update flow

When English content changes:

`English source version N+1 -> affected locale keys become stale -> localization job -> QA -> approved locale version`

Do not regenerate every locale when only a subset of source keys changed.

## Language policy

The first production target is the currently supported core locale set. Additional locales already present in the repository remain supported, but the architecture does not require creating a separate data model per language.

Dialect/colloquial language is a search-intelligence concern by default, not a replacement for professional UI copy.
