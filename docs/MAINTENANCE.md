# FLIXO Lightweight Maintenance

The maintenance layer is development/build-time only. It does not add runtime dependencies or application middleware.

## Fast local hygiene

- `npm run lint:fast` — Biome lint check.
- `npm run format:fast` — Biome format check.
- `npm run format:fix` — apply Biome safe formatting changes.
- `npm run maintenance:fast` — Biome check followed by Knip.
- `npm run dead-code` — report unused files, exports, and dependencies.
- `npm run dead-code:fix` — apply Knip's safe fixes; review the diff before committing.

Biome is intentionally additive for now. ESLint and Prettier remain the canonical CI contracts until a dedicated migration proves parity. Biome 2.5.9 supports combined formatting/linting workflows; Knip 6.31.0 is used for dead-code analysis. 

## Dependency maintenance

Dependabot is configured in `.github/dependabot.yml` for npm and GitHub Actions on a weekly cadence. Update PRs remain subject to the existing CI and canonical verification gates.

## Upgrade policy

Use AST-based codemods only for migrations with an explicit upstream codemod and a dedicated verification run. Do not run broad automated rewrites across `src/routes/-virtual` or generated route trees.

## Safety rule

Do not run `knip --fix`, formatting write commands, or codemods blindly on a release branch. Review the complete diff and rerun `npm run verify` before promotion.
