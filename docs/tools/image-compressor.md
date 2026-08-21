# FLIXO — Image Compressor

> Quick-access technical profile for maintenance, debugging, testing, and future upgrades.

## Identity

- **Tool ID:** `image-compressor`
- **Route (EN):** `/en/image-compressor`
- **Route (AR):** `/ar/image-compressor`
- **Source:** `src/tools/image-compressor/`
- **Engine:** `src/tools/image-compressor/engine.ts`
- **UI:** `src/tools/image-compressor/index.tsx`
- **Localized pages:** `src/tools/image-compressor/locale-pages.tsx`
- **Tests:** `tests/image-compressor.spec.ts`
- **Image diagnostics:** `src/lib/diagnostics/image.ts`
- **Runtime diagnostics:** `src/lib/diagnostics/runtime.ts`

## Current status

- **Production status:** Ready
- **CI status:** Green on the last fully verified tool run
- **Evidence standard:** CI + real Playwright output checks
- **Processing model:** Browser-side / client-side
- **Maximum input size:** 10 MB per file
- **Maximum selected files:** 20
- **Maximum output canvas:** 40 million pixels

## Capabilities

- JPG input
- PNG input
- WebP input
- GIF input
- BMP input
- SVG input
- JPG output
- PNG output
- WebP output
- Quality control
- Target-size optimization for quality-based formats
- Maximum width
- Maximum height
- Before/after previews
- Measured before/after file size
- Output dimensions
- Batch processing
- ZIP export
- English and Arabic UI
- Localized SEO metadata
- Runtime diagnostics
- Image-output validation

## Test coverage

The regression suite covers:

1. Real WebP output
2. PNG output with resize
3. Target-size ceiling
4. Batch ZIP output
5. Oversized input rejection
6. Huge-dimension / memory-safety rejection
7. Arabic route, RTL, and localized SEO
8. Runtime diagnostics smoke test

## Safety rules

- Never remove input-size or pixel-count guards without a replacement safety mechanism.
- Never weaken an E2E assertion just to obtain green CI.
- Any new advertised input format must have a real decode path and regression test.
- Any new output format must validate MIME, dimensions, and actual blob output.
- Keep image processing client-side unless a future product requirement explicitly justifies server processing.
- Do not place API keys or secrets in this tool.

## Future upgrade queue

### Priority 1 — Performance

- Move heavy image work to a Web Worker.
- Replace sequential batch compression with bounded parallel workers.
- Replace JSZip with `fflate` after CI-safe lockfile verification.
- Add memory-aware batch scheduling for large inputs.

### Priority 2 — Product quality

- Add stronger output integrity checks after encoding.
- Add richer compression presets.
- Improve very-large-image handling and progress reporting.

### Priority 3 — Local AI

- Add lazy-loaded local background removal.
- Keep AI models out of the initial page bundle.
- Add dedicated E2E coverage for AI success and failure paths.

### Priority 4 — Observability

- Connect external runtime monitoring (Sentry) when the project connection is available.
- Keep the existing local runtime diagnostics as a fallback layer.

## Known constraints

- Browser decoding and Canvas capabilities vary by environment.
- PNG target-size optimization is not quality-based and must not pretend otherwise.
- Large images can remain memory-intensive even with a small file size.
- Batch workloads need bounded concurrency before exposing very large batches.

## Change protocol

Before upgrading this tool:

1. Read this file first.
2. Read `docs/ERROR_MEMORY.md`.
3. Inspect the current engine and tests.
4. Make the smallest isolated change.
5. Run the focused E2E shard(s).
6. Run the full parallel CI.
7. Update this file with the new capability or known constraint.
8. Record any verified failure in `docs/ERROR_MEMORY.md`.

## Quick commands

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e -- tests/image-compressor.spec.ts
```

## Ownership principle

This file is the **entry point for future work on the tool**. Do not scatter upgrade notes across unrelated documentation. Keep architecture changes near the tool source and keep this file as the current map.