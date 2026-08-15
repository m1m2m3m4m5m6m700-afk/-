# Flixo Verified PDF Catalog

Flixo exposes a dedicated PDF workspace in the Mega Tool Hub. The canonical PDF catalog contains 12 implemented operations, each generated across 11 presets, for 132 PDF tool variants.

## Verified operations

- Inspect PDF metadata
- Extract text
- Rotate pages
- Add page numbers
- Add watermark
- Remove common metadata
- Duplicate the final page
- Extract a page range
- Extract even-numbered pages
- Add a blank cover
- Flatten supported form fields
- Render a first-page poster

The variants are generated from `src/data/megaToolsCatalog.ts` and executed by `src/lib/megaToolsEngine.ts`. They are not separate fake pages or placeholder cards.

## Acceptance test

`tests/pdf-tools.spec.ts` creates a real two-page PDF fixture with `pdf-lib`, executes all 132 generated variants, and checks that each result is non-empty and structurally valid. Download results are fetched through their generated object URL and must return a non-empty PDF blob.

The dedicated test is part of `npm test` through `npm run test:pdf`, and the catalog itself is guarded by `npm run validate:pdf-catalog`.

A tool is not considered production-verified merely because this test exists; the acceptance status is the result of the CI run for the exact commit. This keeps the repository honest about what has actually executed.

For context, Adobe's current Acrobat online toolset also lists common PDF operations such as merge, split, crop, delete, rotate, reorder, extract, insert, page numbering, conversion, compression, and signing/protection. Flixo should only expose additional operations when their own runtime and output tests pass. 
