# Tool Release Readiness

## Current public runtime set

`src/lib/tool-runtime/readyTools.ts` is the source of truth. The current public tools are:

- `zip-creator`
- `archive-extractor`
- `file-splitter`
- `metadata-viewer`

## Required evidence before republishing

Every public tool must have all of the following:

1. Real runtime binding in `readyTools.ts`.
2. Real route under `src/routes/tools/`.
3. Content registry entry.
4. SEO registry entry.
5. Desktop E2E coverage.
6. Repeatability coverage.
7. Production build success.
8. Production dependency audit success.

## Release Candidate procedure

Run the manual `Tool Release Candidate` workflow from GitHub Actions.

It performs:

- public-tool preflight
- Chromium installation
- desktop E2E for all current public tools, repeated three times
- production build
- production dependency audit
- release evidence artifact collection

Do not add a tool to the public registry until its own runtime and E2E evidence are present.

## Republish gate

A republish is allowed only when the RC workflow succeeds and the normal critical gates (`Verification Matrix`, `Tool Platform`, and `Release Certification`) are green for the same commit.
