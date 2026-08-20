# FLIXO Early Detection Suite

FLIXO now uses a layered, free/open early-detection stack. Each tool has one primary responsibility; overlapping tools are retained only when they provide a distinct signal.

| Layer | Tool | Primary signal | Policy |
| --- | --- | --- | --- |
| SAST | Semgrep Community | TypeScript/React security and code patterns | Advisory until baseline is reviewed |
| SAST / semantic security | CodeQL | Data-flow and security queries | Advisory |
| Secrets | Gitleaks | Secrets in files and git history | Advisory |
| Dependency SCA | OSV-Scanner | Known dependency vulnerabilities | Advisory |
| Dependency delta | Dependency Review | New vulnerable dependencies in PRs | Advisory |
| Filesystem/IaC | Trivy | Vulnerabilities and misconfiguration | Advisory |
| SBOM | Syft | CycloneDX software inventory | Artifact |
| SBOM/SCA | Grype | Vulnerabilities matched against SBOM/files | Advisory |
| Actions security | Zizmor | GitHub Actions security patterns | Advisory |
| Workflow correctness | actionlint | YAML/expression/workflow correctness | Advisory |
| Supply-chain posture | OpenSSF Scorecard | Repository and workflow hardening posture | Advisory/scheduled |

## Error integration

Every scanner should produce a machine-readable artifact when available. The unified CI error pipeline can normalize failures into `error-report.json`, while SARIF-producing scanners are uploaded to GitHub Code Scanning when supported.

## Why advisory first?

The repository already has a strict deterministic verification gate. New scanners start as advisory so that an existing baseline does not turn the first integration run into an opaque wall of unrelated findings. After the baseline is triaged, selected high-confidence checks can be promoted to required status individually.

## No automatic repair

These scanners report findings. They do not modify source code, dependencies, workflows, or releases. FLIXO keeps `autoApply=false` and requires human review before remediation.
