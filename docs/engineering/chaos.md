# FLIXO Chaos / Fault-Injection Contract

Status: IMPLEMENTED / STRUCTURAL PASS

## Required scenarios
- AI provider unavailable
- AI provider returns 429
- AI provider returns 5xx
- Network timeout
- Database unavailable
- Missing environment variable
- Malformed user upload
- Corrupt PDF/image payload
- Storage failure

## Expected behavior
Each scenario must produce:
- deterministic failure classification
- sanitized `error-report.json`
- no secret leakage
- no data corruption
- no `autoApply=true`
- recovery or explicit fail-closed behavior

Chaos tests are safe-by-default and must run against isolated/local fixtures. Production fault injection requires explicit approval and is never automatic.
