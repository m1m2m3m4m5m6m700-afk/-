# FLIXO Error Memory

Purpose: preserve verified failures, their root causes, evidence, fixes, and prevention rules so the same class of error is not reintroduced.

## Rules

- Record only verified failures or warnings with concrete evidence.
- Separate root cause from symptoms.
- Never mark an issue fixed until CI or a reproducible check proves it.
- Prefer fixing the production code over weakening an assertion.
- Do not store secrets, API keys, user images, or personal data here.
- Add the next incident to this file after diagnosis, not before.

## Incident Index

| ID | Area | Severity | Status | Root cause |
|---|---|---:|---|---|
| F-001 | CI / E2E artifacts | Medium | Fixed | Artifact names contained `/` |
| F-002 | CI / upload action | Low | Fixed | `upload-artifact@v4` emitted Node 20 deprecation warning |
| F-003 | SEO / E2E | Medium | Fixed | Base `index.html` contained a second `meta description` |
| F-004 | E2E contract | Medium | Fixed | Assertion expected wording different from the real SEO contract |
| F-005 | E2E timing | Medium | Superseded | Test waited for presentation text before verifying output |
| F-006 | Image engine / SVG | High | Fixed in code; CI revalidation pending | `createImageBitmap()` failed to decode SVG in Chromium CI |
| F-007 | CI / dependency contract | High | Fixed in code; CI revalidation pending | `package.json` dependency ranges drifted from the checked-in `package-lock.json` root manifest |
| F-008 | CI / route diagnostics | Medium | Fixed in code; CI revalidation pending | Preflight searched only `src/routes` and treated valid `-virtual` re-export sources as missing |

---

## F-001 — Invalid E2E Artifact Names

**Area:** GitHub Actions / Playwright diagnostics  
**First observed:** Run #1324/#1325 era  
**Symptom:** E2E shard failed while uploading diagnostics with names such as `e2e-diagnostics-shard-2/6`.  
**Root cause:** `/` is not allowed in GitHub artifact names. The same shard value was used both as the Playwright `--shard` value and as the artifact name.  
**Evidence:** GitHub annotation explicitly reported `Forward slash /` as invalid.  
**Fix:** Decoupled the test shard expression from the artifact label and used names such as `e2e-diagnostics-shard-2-of-6`.  
**Prevention:** Never use `N/M` directly in an artifact name. Convert it to `N-of-M` or use a numeric matrix index.

## F-002 — upload-artifact Node 20 Deprecation

**Area:** CI infrastructure  
**Symptom:** GitHub warned that `actions/upload-artifact@v4` targeted Node.js 20 and was being forced onto Node.js 24.  
**Root cause:** Workflow still referenced an older action major version.  
**Fix:** Upgraded to `actions/upload-artifact@v6`.  
**Evidence:** Subsequent E2E logs show `actions/upload-artifact@v6` and successful artifact finalization.  
**Prevention:** Pin current maintained major versions for GitHub Actions and review Node-runtime deprecation notices separately from application failures.

## F-003 — Duplicate Meta Description

**Area:** SEO / React-TanStack head management  
**Symptom:** E2E detected more than one `meta[name="description"]`.  
**Root cause:** `index.html` contained a legacy static description (`Flixo foundation`) while the route also supplied the production SEO description.  
**Fix:** Removed the legacy description from the shell so the route is the single source of truth for the tool page metadata.  
**Prevention:** Keep global HTML shell metadata minimal and let localized routes own page-specific SEO tags.

## F-004 — E2E Text Contract Drift

**Area:** Playwright / SEO contract  
**Symptom:** E2E searched for wording that the page no longer used.  
**Root cause:** Test assertion and the actual page SEO contract had diverged.  
**Fix:** Updated the assertion to match the intended production description instead of changing the page merely to satisfy the old assertion.  
**Evidence:** The route defines the description as `Compress JPG, PNG, and WebP images online in your browser...`.  
**Prevention:** Assertions should target stable product contracts and semantic output, not incidental prose.

## F-005 — E2E Timeout on Result Presentation

**Area:** Playwright / image processing  
**Symptom:** The first failing shard timed out after 5 seconds while waiting for `/smaller file size/`.  
**Root cause:** The test used a presentation string as the first synchronization point rather than the actual output artifact.  
**Fix:** Increased the allowed processing window and moved verification toward the real download output.  
**Important:** This incident was only a timing symptom. The following run proved the underlying image path still had a real production defect (F-006), so increasing the timeout was not accepted as the final fix.

## F-006 — SVG Decode Failure in Image Compressor

**Area:** Image engine / Chromium E2E  
**Symptom:** The output link never appeared within the test window. Diagnostics showed: `The source image could not be decoded.`  
**Root cause:** The engine relied on `createImageBitmap(file)` for all supported image types, but SVG decoding was not reliable in the Chromium CI environment. The product advertised SVG input support.  
**Evidence:** Run #1329 E2E Shard 2 failed; the uploaded screenshot showed the user-facing decode error. The engine previously called `createImageBitmap(file)` directly.  
**Fix:** Added an SVG-safe decode fallback using `HTMLImageElement` plus an object URL, while retaining `createImageBitmap()` for raster images and cleaning up the object URL.  
**Status:** Code fix committed as `753dbe71a235d158574f04107ea527cbe3b62280`; CI revalidation is required before declaring fully fixed.  
**Prevention:** Every advertised input format must have a dedicated decode path covered by a real E2E input fixture.

## F-007 — Manifest / Lockfile Drift

**Area:** CI / dependency contract  
**Symptom:** The early integrity preflight failed before `npm ci` with: `manifest/lock drift in dependencies: @radix-ui/react-tooltip (^1.1.11 != ^1.2.8)`.  
**Root cause:** `package.json` was edited independently from the checked-in lockfile and several dependency ranges drifted.  
**Evidence:** CI Run #1796, ESLint and Production Build both stopped at the `Early integrity preflight` step before dependency installation.  
**Fix:** Restored `package.json` dependency ranges to the root manifest recorded in `package-lock.json`, including `@radix-ui/react-tooltip@^1.2.8`, `jspdf@^4.2.1`, and the other lock-aligned ranges.  
**Prevention:** Keep the manifest/lock comparison as a blocking preflight check and update both files together.

## F-008 — False Virtual Route Warnings

**Area:** CI / route diagnostics  
**Symptom:** The preflight emitted dozens of `Could not resolve virtual route source` warnings for valid `-virtual` route re-exports.  
**Root cause:** The preflight enumerated `src/routes` while intentionally excluding `src/routes/-virtual`, then tried to resolve the excluded files as if they were normal source routes.  
**Evidence:** CI Run #1796 showed warnings for `en-background-remover`, `ar-background-remover`, `/api/ai/plan`, `robots.ts`, `sitemap.ts`, and most other virtual entries.  
**Fix:** Preflight now resolves `src/routes/-virtual/*` re-export files back to their actual source modules and validates their declared route path.  
**Prevention:** Diagnostics must understand generated/virtual route topology instead of treating generated artifacts as missing source files.

---

## Reusable Diagnostic Checklist

When an E2E shard fails:

1. Read the failed step and exact assertion/error.
2. Decide whether failure is application, test contract, CI infrastructure, or environment.
3. Inspect screenshot/trace before changing code.
4. Reproduce with the smallest real input.
5. Fix the root cause.
6. Add or strengthen a regression test if the failure exposed a missing contract.
7. Re-run the smallest failed shard first.
8. Re-run the full parallel CI before closing the incident.
9. Append the verified incident and evidence to this file.

## Current Gate

- F-007 and F-008 are fixed in code and require the next CI run on the current branch HEAD for final verification.
- The last observed CI failure was Run #1796 on merge SHA `c7c60870f6b088a87e321c2861584201dbbfab4b`; it failed at preflight, before `npm ci`, so those failures did not yet exercise the application build itself.

## CI failure 2026-08-22T15:32:47.805Z
- Fingerprint: `flx-161814e7`
- SHA: `c7c60870f6b088a87e321c2861584201dbbfab4b`
- Run: [#1796](https://github.com/m1m2m3m4m5m6m700-afk/FLIXO-AI-TOOLS/actions/runs/32581812732)
- Job: `diagnostic-summary`
- Ref: `136/merge`

### Extracted diagnostics
- typecheck=failure
- lint=failure
- build=failure
- e2e=failure
- trace correlation: client uses x-flixo-trace-id + W3C traceparent; inspect failed E2E artifact for browser trace

### Correlation
- Client trace IDs use `x-flixo-trace-id` and W3C `traceparent`; runtime/API diagnostics also emit stable fingerprints.

---
