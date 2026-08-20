# AI Quality Certification

## Official status

The FLIXO AI quality system has two separate states:

- **AI Quality Infrastructure: 10/10** — deterministic evaluator, live prompt corpus, live smoke runner, SHA verification, CI workflow, and evidence artifact are implemented.
- **Live AI Certification: Pending** — certification is not granted until the live smoke suite is executed against a real provider-backed Flixo endpoint and produces evidence for the exact commit SHA.

## Certification rule

A commit is **Live AI Certified** only when all of the following are true:

1. `npm run test:ai:live` executes against a configured `FLIXO_AI_SMOKE_ENDPOINT`.
2. The endpoint is backed by a real configured AI provider.
3. All live prompt cases pass their hard checks.
4. The overall hard score meets the corpus threshold.
5. `manualReviewItems` is zero before the final certification decision.
6. `.artifacts/gates/ai-live-quality.json` is produced for the exact commit SHA.
7. No API key, provider credential, or secret is committed to the repository.
8. A failed, skipped, missing, or incomplete live run means **NOT CERTIFIED**.

## Evidence boundary

Deterministic AI quality tests validate the evaluator and known regressions. They do not prove live model quality by themselves.

The live suite validates actual provider-backed responses. Semantic, safety, source-attribution, and other nuanced checks may require manual review; those cases prevent certification until reviewed.

## Release interaction

Live AI Certification is a distinct evidence layer from Tool Platform and Tool Release Candidate certification. It must never be inferred from build success, TypeScript success, or deterministic contract success.

A new commit resets the live AI certification because evidence is SHA-specific.
