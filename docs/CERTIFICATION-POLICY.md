# Flixo Certification Policy — Gate Manifest Schema v1

## Purpose

Every tool that is eligible for release MUST use the same evidence contract:

`Gate → gate-manifest.json → verification → release-decision.json`

The authoritative contract is `scripts/certification/schemas/gate-manifest.schema.json`.

## Required certification stages

A releasable tool MUST provide these stages unless an approved tool-specific exception is documented:

1. `fast` — contract, smoke, registry/runtime foundation, and basic integrity checks.
2. `medium` — security/performance checks appropriate to the tool.
3. `windows` — desktop/Windows operational smoke coverage where the runtime is browser-operational.
4. `node` — deterministic non-browser/runtime-level coverage appropriate to the tool.
5. `browser` — critical user-visible workflow and output correctness.
6. `stability` — repeated critical-path execution; the canonical baseline is three repetitions.
7. `full` — complete project/tool regression, build, and production dependency audit.
8. `release` — validates every required manifest and produces the single `release-decision.json`.

A stage may contain different commands for different tools, but the evidence contract MUST remain identical.

## Manifest rules

- `schemaVersion` MUST be `1`.
- `commit` MUST equal the tested Git SHA.
- `runId` MUST identify the exact Actions run that produced the evidence.
- Evidence MUST be SHA-256 hashed.
- A manifest MUST be unexpired when evaluated.
- A release is `CERTIFIED` only when every required gate is valid and has `status=success`.
- Missing, expired, hash-mismatched, commit-mismatched, or run-mismatched evidence is blocking.

## Retry and failure handling

Retries are allowed, but the final evidence MUST come from the exact run being certified. A retry does not inherit evidence from a different commit or run.

Cascade failures are diagnostic context only; they never turn a failed required gate into a success.

External provider failures such as deployment rate limits are non-authoritative for application certification unless the policy explicitly promotes that provider check to a critical gate.

## Canonical implementation

`qr-independent-certification.yml` is the canonical implementation. New tool certification workflows should copy its gate structure and replace only tool-specific commands, fixtures, baselines, and required gate names.

## PDF Merge pilot

`pdf-merge-independent-certification.yml` is the first pilot of this contract outside QR. Its purpose is to prove that PDF Merge can produce the same manifest chain before the pattern is generalized to the remaining platform tools.
