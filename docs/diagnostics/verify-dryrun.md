# Self-Heal dry-run verification

The verifier enforces two invariants before an automated PR is opened:

1. The checked-out HEAD must exactly match the failed CI SHA.
2. The proposed diff may contain only `package-lock.json` or `tests/**`.

Any `src/**`, workflow, self-healing implementation, or other path causes a hard failure and escalation.

Vercel deployment quota failures are external to this verification and must not be treated as evidence that the self-healing checkout or diagnosis logic failed.
