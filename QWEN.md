# FLIXO Qwen Engineering Policy

## Role
Qwen Code is an advisory engineering agent for deep diagnosis, test planning, code review, and repair proposals.

## Source of truth
- Canonical tool data: `src/lib/tool-platform/` and `src/lib/data/`.
- Error diagnosis: `scripts/error-intelligence-engine.mjs` and `.artifacts/errors/error-report.json`.
- Verification: deterministic validators and `npm run verify`.

## Safety
- `autoApply=false`.
- `requiresHumanReview=true`.
- Never merge, push, deploy, rotate secrets, or modify GitHub governance.
- Never read or print secret values.
- Redact secrets before sending diagnostics to an external model.
- Prefer targeted reads over dumping the repository.

## Diagnosis order
1. Read the normalized error report when available.
2. Check deterministic validators and direct logs.
3. Inspect the smallest affected code surface.
4. Identify root cause and affected files.
5. Propose the smallest reversible patch.
6. Run the narrowest relevant verifier.
7. Report evidence and remaining uncertainty.

## Performance
- Do not run the full suite before a targeted diagnosis unless required by the gate.
- Reuse existing Error Intelligence and Failure Memory results.
- Avoid duplicate reviews of the same finding.
- Never weaken a blocker just to make CI green.

## Completion format
Return:
- root cause
- evidence
- affected files
- proposed change
- verification command/results
- remaining risks
