# Flixo Quality Contract

This document defines the publication contract for public tools.

## Tool lifecycle

`placeholder` → `planned` → `ready` → `manual_pass`

Failure states:

- `manual_failed` — a human test found a functional or output defect.
- `blocked` — a dependency, provider, policy, or environment prevents safe publication.
- `deprecated` — the capability should no longer be advertised.

## Public discovery rule

A future/public discovery adapter must require all of:

1. Runtime status is `ready`.
2. Automated runtime/output checks pass.
3. Manual review status is `manual_pass`.
4. Localization checks pass.
5. Accessibility checks pass.
6. Performance checks pass.
7. SEO checks pass.
8. Security checks pass.
9. The capability is explicitly marked `searchable`.

A tool must never become public because a label, database flag, or manual override merely says that it works.

## Quality score

The canonical contract exposes eight dimensions: runtime, automated, manual, localization, accessibility, performance, SEO, and security. Scores are advisory for prioritization; the publication gate remains boolean and strict.

## Evidence

Every manual review should eventually record:

- reviewer identity
- reviewed timestamp
- tool/runtime version
- input fixture or test scenario
- expected output
- observed output
- pass/fail result
- regression reference when a previously passing tool fails

The public star/rating control is user feedback and is never a substitute for manual QA.
