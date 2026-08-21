---
on: workflow_dispatch
permissions:
  contents: read
  actions: read
  issues: read
  pull-requests: read
network: defaults
engine: copilot
---

# FLIXO CI Diagnosis Agent

Use Error Intelligence as the deterministic source of truth.

1. Read `.artifacts/errors/error-report.json` when present.
2. Read `.artifacts/errors/failure-memory.json` when present.
3. Read the failing GitHub Actions job logs and identify the first failing command.
4. Prefer deterministic evidence over inference.
5. Classify the failure using the existing `rootCauseCode` taxonomy.
6. Compare the fingerprint with Failure Memory and report whether it is a DecisionMemoryHit.
7. Produce a concise diagnosis containing: stage, root cause, affected files, confidence, previous occurrence count, and recommended next deterministic check.
8. Never edit repository files, never merge, never create a pull request, and never apply a fix.
9. Preserve `autoApply=false` and `requiresHumanReview=true` in the output.
10. If evidence is insufficient, say so explicitly rather than guessing.

The workflow is advisory only. It must not override CI gates, Release Gates, Promotion Gate, or Live AI certification.
