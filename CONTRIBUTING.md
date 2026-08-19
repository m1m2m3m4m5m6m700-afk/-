# Contributing to FLIXO-AI-TOOLS

## 1. Branch Policy

The repository uses two operational branches only:

### `main`
The official production/reference branch.

- No direct pushes.
- Changes enter through a Pull Request.
- Required certification gates must pass before merge.
- `main` must remain buildable and releasable.

### `experimental`
The single development and experimentation branch.

- New development and experiments happen here.
- It is not a production certification.
- New long-lived development branches should not be created.

## 2. Development Flow

The official lifecycle is:

`Implement → Verify → Certify → Freeze → Promote`

```text
experimental
    ↓
Development
    ↓
Fast
    ↓
Medium
    ↓
Functional
    ↓
Browser Critical
    ↓
Stability
    ↓
Full
    ↓
Evidence Integrity
    ↓
Release Decision
    ↓
CERTIFIED
    ↓
Pull Request
    ↓
main
```

## 3. Pull Request Policy

Every PR must:

- have a clear, limited scope;
- target `main` for promotion;
- pass the required CI/certification gates;
- publish valid Evidence and Gate Manifests when certification applies;
- bind evidence to the required commit and run;
- avoid using stale or unrelated evidence.

## 4. Certification Rules

A tool is release-ready only when the applicable release decision is `CERTIFIED`.

At minimum, certification evidence must match the expected:

```text
commit
runId
sha256
expiresAt
baseline
```

A route, component, or runtime existing in the repository does not by itself make a tool certified.

## 5. Baseline Policy

Certified tools use:

```text
baselines/
└── <tool>/
    ├── certification-baseline.json
    └── provenance.json
```

Baselines are:

- bound to a specific certified commit and run;
- integrity-checked using evidence hashes;
- immutable after freeze;
- not regenerated merely because a transient retry occurred.

A new baseline requires a new full re-certification.

## 6. CI Policy

Certification gates should remain independently rerunnable where practical:

```text
Fast
Medium
Windows
Node Matrix
Browser Critical
Stability
Full
Release Decision
```

When a gate fails, rerun or repair the failing gate rather than unnecessarily repeating successful work.

`Release Decision` is the final certification authority and produces `CERTIFIED` or `REJECTED`.

## 7. Evidence Policy

Evidence must identify the execution context and integrity data required by the certification contract:

```text
commit
runId
gate
sha256
createdAt
expiresAt
```

Evidence from the wrong commit/run, expired evidence, or modified evidence must be rejected.

## 8. Tool Lifecycle

```text
placeholder
    ↓
planned
    ↓
ready
    ↓
certified
    ↓
frozen baseline
    ↓
public
```

Public discovery must not expose a tool merely because placeholder or planned code exists.

## 9. Security

Do not:

- commit secrets;
- disable security checks to make CI green;
- use forceful dependency changes blindly to hide failures;
- bypass Release Decision manually;
- treat an external deployment-service failure as proof of an application-code failure.

External-service failures must remain separately classified from product-code failures.

## 10. Change Management

Major changes to runtime behavior, CI, certification, baseline schemas, security, or release workflows should be developed in `experimental` first and promoted to `main` only after the required verification.

## 11. Repository Hygiene

Operational branch policy is:

```text
main
experimental
```

Short-lived branches that are still required for an active migration may exist temporarily, but they should be removed after their purpose is complete. Do not create new long-lived feature branches.

## 12. Definition of Done

A change is complete when the applicable requirements are satisfied:

- implementation complete;
- relevant tests pass;
- build passes when applicable;
- evidence is complete when certification applies;
- Gate Manifest is valid when certification applies;
- Release Decision is `CERTIFIED` when release certification is required;
- documentation is updated;
- the PR is ready for promotion.

## 13. Golden Rule

> Code is not considered ready because it worked once. It is considered ready when it proves itself through the required verification and certification cycle.
