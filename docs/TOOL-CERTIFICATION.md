# FLIXO Tool Certification

A tool may be `public` only when it is `certified`.

## Certification ladder

`draft` → `implemented` → `verified` → `public`

Certification requires all of the following:

- render and interaction checks
- exact output checks
- explicit error behavior
- security validation
- performance budget declaration and validation
- mutation testing
- invariant/golden-fixture testing
- auditable Evidence with SHA-256 fingerprints
- regression lock
- explicit data-processing policy

## Evidence contract

Each public tool writes a JSON evidence record containing:

- `schemaVersion`
- `toolId`
- `testName`
- `status`
- `inputFingerprint`
- `expectedFingerprint`
- `actualFingerprint`
- `commitSha`
- `environment`
- `timestamp`

Evidence is stored outside Playwright's disposable `test-results` tree in `.artifacts/verification-evidence`.

## Release rule

No public tool may be promoted unless its certification contract passes in CI. A regression removes certification until the failing gate is repaired.

## Privacy rule

The current certified desktop tools are explicitly `local-only`; their input files must not be sent to a server as part of normal tool execution.
