# Observability Contract

This document defines the integration boundary for production observability without making provider credentials part of the repository.

## Metrics

Track at minimum:

- tool execution count and success/failure rate
- certification gate duration
- build duration
- LCP and CLS in production telemetry
- API response latency where server APIs exist

## Error tracking

Sentry or an equivalent provider may be enabled through deployment configuration only. No DSN, token, or secret belongs in source control.

Critical tool failures should include `toolId`, route, app version/commit, and a privacy-safe error signature.

## Distributed tracing

OpenTelemetry is the preferred neutral tracing boundary for server-side AI/API work. Browser tracing must remain privacy-preserving and exclude file contents and user-provided sensitive payloads.

## Alerting policy

- Critical availability/correctness failures: immediate alert.
- Sustained p95 latency regression: investigate before release promotion.
- Certification regressions: block promotion.
- Third-party quota/rate limits: classify as external operational state, not product-code failure.
