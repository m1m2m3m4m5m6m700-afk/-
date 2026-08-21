# FLIXO Data Domains

`src/lib/data/` is the public data-access boundary for the application.

## Domains

| Domain | Entry point | Current source | Responsibility |
| --- | --- | --- | --- |
| Tools | `./domains/tools` | `src/lib/tool-platform/*` | tool identity, lifecycle, capabilities, routes |
| Categories | `./domains/categories` | `src/lib/tool-platform/categories.ts` | category identity/presentation |
| Content | `./domains/content` | `src/data/toolContent.ts` | tool descriptions, workflows, FAQs, E-E-A-T |
| Localization | `./domains/localization` | `src/data/toolContentLocales.ts` | curated locale overrides |
| SEO | `./domains/seo` | `src/data/toolSeo.ts` | per-tool SEO metadata |
| Enterprise SEO | `./domains/seo-enterprise` | `src/data/seoEnterpriseData.ts` | comparisons, use cases, file-type landing data, tool metrics |
| Blog | `./domains/blog` | `src/data/blogData.ts` | editorial content |
| Roadmap | `./domains/roadmap` | `src/data/competitiveToolRoadmap.ts` | product/competitive roadmap |
| Knowledge | `./domains/knowledge` | `src/data/knowledgeHub.ts` | educational/knowledge content |
| Sponsors | `./domains/sponsors` | `src/data/sponsors.ts` | partner/sponsor data |
| Integrations | `./domains/integrations` | `src/data/capcutVerifiedTools.ts` | external/verified integration data |

## Rules

1. New application code imports from `src/lib/data/*`, not from `src/data/*`.
2. Tool identity comes only from `src/lib/tool-platform/*`.
3. `src/data/*` is a migration layer, not a new integration surface.
4. Large registries are split physically only after automated validation proves that keys and exports are unchanged.
5. Each domain owns its types and access patterns; cross-domain access goes through the domain gateway.

## Physical extraction plan

The remaining large registries (`toolContent.ts`, `toolSeo.ts`, `seoEnterpriseData.ts`) are intentionally behind domain adapters first. They can then be split by record/group without changing consumers.
