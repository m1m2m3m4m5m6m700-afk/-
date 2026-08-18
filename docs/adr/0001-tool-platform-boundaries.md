# ADR 0001 — Tool Platform Boundaries

- Status: Accepted
- Date: 2026-08-18

## Decision

FLIXO uses explicit boundaries between tool metadata, tool execution, routes/UI, and validation. `src/lib/tool-runtime` must not depend on Legacy catalog files under `src/data` when an equivalent runtime contract exists.

The public registry is the single publication source. Tool lifecycle is the release control: candidate → verified → public.

## Rules

1. Runtime code consumes stable contracts, not catalog implementation details.
2. A tool cannot become `public` without a verified route, interaction test, result oracle, error case, and evidence.
3. Validators are gates, not optional diagnostics.
4. Legacy code may remain isolated for restoration, but cannot become an implicit dependency of new runtime code.

## Consequences

This keeps the platform extensible and lets new tools be added without reopening historical dependencies. It also makes failures local: a tool failure should fail its verification gate rather than corrupt unrelated tools.
