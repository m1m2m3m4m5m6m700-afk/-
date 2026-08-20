# FLIXO Error Intelligence Suite

## Purpose
Deterministic-first analysis of CI failures. The suite extracts an error type and message, creates a stable signature, identifies likely root cause, builds a contextual debug report, and persists the decision for trend analysis.

## Pipeline

`CI log → Log Reader → Signature → Root Cause → Contextual Debugger → Decision Log → Trend Dashboard`

The suite is read-only. It does not modify application files and it never grants repair authority. Existing V4/Self-Heal policy remains the only authority for an actual repair.

## Run against a real CI log

```bash
node scripts/error-intelligence/index.mjs diagnostics/npm-verify.log
```

## Deterministic-first policy

Known signatures are classified without external AI. An optional provider can be configured only when `FLIXO_AI_ALLOW_EXTERNAL=true`, `FLIXO_AI_PROVIDER` and `FLIXO_AI_ENDPOINT` are present. Unknown cases otherwise remain escalated for review.

## Evidence contract

Each analysis contains:

- `parsed.errorType`, `parsed.errorMessage`, `parsed.affectedFile`
- stable `signature`
- `rootCause`, `affectedFiles`, `dependencyImpact`, `confidence`
- `proposedFix` and reproduction steps
- `policy.readOnly=true` and `policy.autoApplyAllowed=false`

## Memory

Historical decisions are stored as JSON Lines in `history/errors.jsonl` by default. The path can be overridden with `FLIXO_ERROR_HISTORY`.

## Tests

```bash
node --test scripts/error-intelligence/tests/*.test.mjs
```

The acceptance suite includes a TS2322-style CI failure, stable signature generation, root-cause confidence, read-only debugger policy, and trend aggregation.
