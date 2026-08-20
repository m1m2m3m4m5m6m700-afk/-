# FLIXO Observability Contract

Status: IMPLEMENTED / STRUCTURAL PASS

## Required telemetry fields
Every runtime/CI event should be correlatable by:
- `correlationId`
- `timestamp`
- `stage`
- `component`
- `toolId` when applicable
- `errorFingerprint` when applicable
- `commitSha` in CI/release contexts

## Signal layers
- Logs: sanitized structured events
- Metrics: latency, error rate, retries, provider status, CI duration
- Traces: request → route → tool → provider/database boundary
- Health: explicit liveness/readiness checks

No raw secrets, raw provider tokens, or unredacted user documents may enter telemetry.
