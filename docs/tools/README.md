# FLIXO Tool Catalog

This directory contains one quick-access technical profile per product tool.

## Purpose

Each tool profile is the first place to go before maintenance, debugging, testing, or future upgrades. It records the tool's routes, source files, tests, current status, capabilities, constraints, safety rules, and prioritized upgrade queue.

## Rules

- One profile per product tool.
- Keep tool-specific upgrade notes in the tool's profile instead of scattering them across unrelated docs.
- Update the profile when a capability, route, test contract, or important constraint changes.
- Record verified failures in `docs/ERROR_MEMORY.md`.
- Do not list planned tools as production-ready until their code and tests exist.

## Current tools

| Tool | Profile | Source | Status |
|---|---|---|---|
| Image Compressor | `docs/tools/image-compressor.md` | `src/tools/image-compressor/` | Ready |

## Future tools

Add a row only when the tool has an actual implementation or an explicitly tracked development branch. Avoid placeholder catalog entries for speculative tools.
