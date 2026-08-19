# Performance and Coverage Policy

## Coverage

The target is a progressive global coverage floor of 90% once first-party unit/integration coverage is measured reliably. Coverage must never be claimed from an uninstalled or missing coverage provider.

Until coverage tooling is present in CI, the threshold is a policy target rather than a passing gate.

## Performance

Release-oriented targets:

- LCP < 1500 ms on critical tool pages.
- Lighthouse Performance >= 90.
- Accessibility >= 95.
- Main-chunk gzipped size target <= 150 KB.
- Certification gates should record duration and compare against the frozen baseline.

A performance regression is considered actionable even when functional tests pass.

## Stability

Stability runs should remain evidence-driven. Re-validation may repeat a gate when variance is detected; a successful baseline is not replaced merely because a retry was executed.
