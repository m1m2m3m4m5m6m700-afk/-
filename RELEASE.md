# FLIXO-AI-TOOLS Release Checklist

## 0. Release Gate

- [ ] Branch is `develop` (or the approved release branch)
- [ ] HEAD SHA is recorded
- [ ] `npm ci` succeeds
- [ ] `package.json` / `package-lock.json` remain unchanged after install
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## 1. Core Contracts

- [ ] `validate:project-contract` passes
- [ ] `validate:test-quality` passes
- [ ] `validate:tool-platform` passes
- [ ] `validate:tool-platform-lifecycle` passes
- [ ] `validate:tool-platform-boundaries` passes
- [ ] `validate:route-tree` passes
- [ ] `validate:registry` passes
- [ ] `validate:tool-runtime` passes
- [ ] `validate:search-catalog` passes
- [ ] `validate:seo` passes
- [ ] strict security gate passes
- [ ] production dependency audit passes

## 2. Desktop Verification

- [ ] Chromium installation succeeds
- [ ] Desktop smoke suite passes
- [ ] Image Compressor output test passes
- [ ] Image Enhancer output test passes
- [ ] Video Compressor smoke test passes
- [ ] Video Trimmer validation test passes
- [ ] Repeatability run (`--repeat-each=3`) passes
- [ ] No critical test is skipped, focused, or cancelled

## 3. Output Correctness

### Images

- [ ] PNG signature valid
- [ ] First chunk is `IHDR`
- [ ] Expected dimensions valid
- [ ] PNG chunk CRCs valid
- [ ] `IEND` present and final
- [ ] Output is non-empty
- [ ] Download completes successfully

### Video

- [ ] Real fixture is available before enabling deep output validation
- [ ] Processing completes
- [ ] Download completes
- [ ] Output is non-empty
- [ ] Container/header is valid
- [ ] Duration validation is enabled once a stable MP4 fixture exists

## 4. CI Evidence

- [ ] Fresh GitHub Actions run exists for the exact tested SHA
- [ ] Foundation passes
- [ ] Desktop passes
- [ ] Image output tests pass
- [ ] No hidden/cancelled critical job
- [ ] Failure artifacts are available when applicable

## 5. Deployment

- [ ] Vercel deployment is `READY`
- [ ] Vercel deployment SHA matches the tested Git SHA
- [ ] Vercel uses `npm ci`
- [ ] Package/lock contract passes during deployment
- [ ] Production or preview health check succeeds

## 6. Final Decision

### GREEN

All critical checks and deployment evidence pass on the same SHA.

### CONDITIONAL

Critical checks pass, but advisory findings remain documented.

### RED

Any critical contract, build, test, dependency, or deployment gate fails.

## CI Run Evidence

| Field | Value |
|---|---|
| Date | 2026-08-19 |
| Branch | `develop` |
| Tested SHA | `b1e0416976ee1adb34ea5ec0e13479daabf38d18` |
| GitHub Actions Run ID | Pending fresh run |
| Workflow | `Tool Platform` |
| Overall status | `PENDING` |
| Vercel deployment | Pending fresh deployment |
| Vercel status | `PENDING` |

### First Failure

- Job:
- Step:
- Exit code:
- Exact error:
- Root cause:
- Fix commit:
- Re-run ID:

### Final Evidence

- `npm ci`:
- typecheck:
- lint:
- build:
- desktop:
- image output:
- video output:
- dependency audit:
- final decision:
