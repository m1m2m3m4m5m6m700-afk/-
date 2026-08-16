# FLIXO CI Root-Cause Diagnostic Report — 2026-08-16

## Scope

This report records the CI failures and structural problems that are directly evidenced by GitHub Actions runs and repository state available during the audit. It deliberately does **not** claim to summarize all historical runs unless their logs were actually retrieved.

## Snapshot

- `main`: `81ef5ddb834353472c0c86b9ba708057b31389ba`
- Phase 1 head at the time of the audit: `7e30aed8a36aeac0cbc522d587b89ecf1e12f4e4`
- Phase 1 CI workflow fix: `6f7637d945cafebc668b858a8d8dc36848daf699`
- PR #23 original ZIP test head: `aab6d2fb15bd142a6cb2e7b584f506ca834756df`
- PR #23 current head observed: `58fb1b8c13090756831d17f2d5debfe2678e1f2e`

## Environment observed on GitHub Actions

From Run #520:

- Runner: GitHub-hosted `ubuntu-24.04`, Ubuntu 24.04.4 LTS
- Runner image: `20260810.271.1`
- Node: `v22.23.2` from `.nvmrc`
- npm: `10.9.8`
- Playwright Chromium in the runner: Chrome for Testing `151.0.7922.34` / Playwright Chromium `v1234`

## Verified CI history

### Run #514 — cancelled at Flex chat

Run ID: `31918949880`.

All validation/build gates through typecheck and lint passed. `Run Flex chat browser tests` was reached and then cancelled. This establishes that dependency/contract/build gates had already stabilized before the browser layer.

### Run #517 — cancelled at Flex chat

Run ID: `31919005378`.

Again, gates through lint passed. The Flex chat browser test was reached and cancelled. This is consistent with a slow/blocked browser test path rather than an earlier static failure.

### Run #519 — lint failure

Run ID: `31919549916`.

All gates through typecheck passed. Lint failed in `VisitorChatWidget.tsx` because of empty block statements in `catch {}` handlers. Browser tests were skipped.

**Root cause:** the restored Flex widget was reintroduced without satisfying the repository's lint contract.

### Run #520 — TypeScript failure

Run ID: `31919696858`.

All gates 1–27 passed, including build, route-tree validation, localization, security, SEO, and runtime checks. Typecheck failed with two instances of:

```text
TS2345: Type '{ role: string; ... }' is not assignable to type 'ChatMessage'.
Type 'string' is not assignable to type 'Role'.
```

at `VisitorChatWidget.tsx` lines 70 and 82 (the user and assistant message state updates).

**Root cause:** TypeScript inferred the object literals inside state updater expressions as `role: string` instead of the narrow `Role` union.

### Run #535 — cancelled at desktop/file tools

Run ID: `31945040616`.

All gates through accessibility browser tests passed. `Run verified desktop/file tool browser tests` began and was then cancelled before completion.

**Important:** this run is not evidence that ZIP Creator failed. It is evidence that the test stage did not complete.

### Run #537 — current ZIP/desktop verification

Run ID: `31945350160`.

At the time of this report, the run is active and has passed every gate through accessibility browser tests. `Run verified desktop/file tool browser tests` is currently executing.

This is the first current run testing the updated ZIP Creator flow with a live CI execution path.

## Dependency/contract failures observed earlier

The same failure family appeared repeatedly while Phase 1 was being repaired:

1. `react-resizable-panels` existed in the lockfile but was absent from `package.json`.
2. `vite-tsconfig-paths` was declared as `^6.0.0` while the lockfile resolved `^6.0.2`.
3. `@radix-ui/react-toggle-group` was declared as `^1.1.10` while the lockfile resolved `^1.1.11`.

These are all manifestations of **manifest/lockfile contract drift**, not independent application bugs.

### Root cause

Dependency changes were being made by hand without a deterministic `package.json` + `package-lock.json` regeneration/verification step.

### Correct prevention

- Treat `package.json` and `package-lock.json` as an atomic pair.
- Run `npm install --package-lock-only` when intentionally changing dependency ranges.
- Keep `npm ci` and the dependency contract validator as mandatory CI gates.

## Integration contract failure

Observed error:

```text
Missing package script: test:chat
CI is missing required gate: npm run test:chat
```

### Root cause

The package script and its corresponding CI gate were removed/changed without updating the integration contract.

### Correct prevention

Any change to a test script must update all of:

- `package.json`
- CI workflow
- integration contract validator
- corresponding test implementation

as one atomic change.

## Architecture/test drift in Flex chat

Phase 1 temporarily removed `VisitorChatWidget` and its `SiteLayout` integration while existing Flex browser coverage still depended on the widget.

### Root cause

A foundation/reliability phase introduced an application UX/architecture change that was outside the intended scope of the phase and was not reconciled with the existing browser contract.

### Correct prevention

Foundation work must not delete or replace runtime surfaces that active CI tests treat as contracts unless the test contract and migration plan change in the same atomic PR.

## CI orchestration defect

`main` currently has:

```yaml
pull_request:
  branches: [main]
```

PR #23 targets `phase1-reliability-tool-foundation`, so the default workflow definition on `main` does not express that branch as a PR target.

The Phase 1 branch was later changed to include itself as a PR target, but PR #23 still did not immediately receive a dedicated run until a subsequent event produced Run #537.

### Root cause

The repository uses layered PR bases but CI triggers are defined only around `main`. This creates a mismatch between the PR topology and the CI event topology.

### Correct prevention

Either:

1. Standardize all PRs onto `main` for CI visibility, or
2. Explicitly support layered PR bases in the workflow/validation model, including a tested manual dispatch path.

Do not rely on an implicit GitHub behavior for required checks.

## Other non-blocking findings

### npm dependency warnings

`npm ci` reported deprecated packages including:

- `tsconfck@3.1.6`
- `@esbuild-kit/core-utils@3.3.2`
- `@esbuild-kit/esm-loader@2.6.5`
- `recharts@2.15.4`

The production audit gate nevertheless reported `0 vulnerabilities`, so these are maintenance issues rather than the cause of the recorded failures.

### GitHub Actions Node 20 warnings

The runner reported that `actions/checkout@v4`, `actions/setup-node@v4`, and `actions/upload-artifact@v4` target Node 20 and are being forced onto Node 24 by the current runner.

This is a future maintenance risk, not a current failure.

### Build chunk-size warnings

Vite reported several chunks larger than 500 kB after minification. The build still passed.

This is a performance/code-splitting concern, not a CI blocker.

### Localization advisories

Localization validation passed, but the health report contains many intentional English fallbacks and glossary advisories. These should be tracked separately from CI blockers.

## Root-cause ranking

| Priority | Root cause | Evidence | Impact | Action |
|---|---|---|---|---|
| P0 | CI trigger topology does not match layered PR topology | PR #23 initially had no dedicated run | Blocks trustworthy merge gating | Separate CI topology PR |
| P0 | ZIP desktop test was not asserting the actual user flow | PR #23 patch shows old test waited for download before click | Blocks operational confidence | Keep PR #23 and require live pass |
| P1 | Manual dependency/lockfile drift | Three distinct contract failures | Repeated CI breakage | Atomic dependency changes |
| P1 | CI/package-script contract drift | `test:chat` missing | Repeated integration failure | Contracted script+gate updates |
| P1 | Runtime/test contract drift around Flex | Widget removed while browser contract remained | Browser failures/cancellations | Preserve runtime contracts in foundation phases |
| P1 | Restored widget did not initially meet lint/TypeScript strictness | Runs #519/#520 | Blocks browser stages | Typed, lint-clean implementation |
| P2 | Flaky/slow operational browser stages | Runs #514/#517/#535 cancellations | Reduces confidence | Trace/repeat and runtime isolation |
| P2 | Deprecated packages / large chunks / CI action Node warnings | CI warnings | Maintenance/performance risk | Separate cleanup PRs |

## ZIP Creator decision

The correct current test contract is:

1. upload two files;
2. click `Create ZIP`;
3. wait for `Download ZIP` to be visible;
4. click the download link while waiting for Playwright's download event;
5. verify the suggested filename;
6. open the ZIP and verify both file names.

PR #23 implements that flow and must be judged by an actual completed browser run, not by static inspection alone.

## Phase 2 decision

**BLOCKED.**

Do not start `feat/phase2-canonical-versioning` until:

- the current Run #537 completes successfully;
- the desktop/file test suite passes;
- mega-tool operational tests pass;
- build artifact and browser report are uploaded;
- PR #23 has a trustworthy CI result;
- the layered-PR CI topology is fixed or explicitly accepted as a separate pre-Phase-2 gate.

## Next atomic PRs

1. `fix/tests-zip-creator-download` — PR #23 (already open).
2. `chore(ci): make layered PR targets observable` — CI trigger/check topology only.
3. `chore(ci): collect and summarize historical CI failures` — this report/script.
4. `chore(test): harden Playwright browser diagnostics` — trace/video/network/console retention only.
5. `chore(deps): synchronize dependency manifest and lockfile` — only if drift reappears.
6. `chore(ci): update deprecated action runtimes` — GitHub Actions maintenance.
7. `perf(build): split oversized client chunks` — performance-only follow-up.

## Evidence limits

This report is evidence-based on the runs and logs successfully accessible during the audit. The repository currently has many historical workflow runs, but a claim about all historical failures requires running the new collection script (or equivalent GitHub API pagination) and then regenerating the frequency analysis. This report intentionally avoids fabricating a complete 200+ run frequency table from partial access.
