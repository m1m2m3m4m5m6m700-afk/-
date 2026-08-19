# Living Documentation Contract

The repository keeps architecture and tool governance documentation synchronized with the codebase.

## Current layers

- `README.md` — project orientation and development/verification commands.
- `CONTRIBUTING.md` — branch, certification, evidence, and Definition of Done policy.
- `docs/` — architecture, certification, quality, and operational contracts.
- `baselines/` — frozen certification records.
- `config/tool-dependencies.json` — cross-tool dependency relationships.
- `config/quality-gates.json` — progressive coverage and performance targets.

## Planned interactive documentation

Storybook may be enabled for reusable UI components when the component surface is large enough to justify the dependency. API documentation should use OpenAPI only for externally exposed HTTP APIs that have a stable contract.

## Update rule

A change to Tool Platform contracts, certification schemas, public tool lifecycle, or operational policy must update the corresponding documentation in the same PR.
