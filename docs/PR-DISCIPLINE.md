# PR Discipline

## Purpose
Keep AI-assisted development convergent: one root-cause fix, one branch, one reviewable PR.

## Rules
- Never open a new PR when an existing open PR already targets the same root cause; update the existing branch instead.
- Before opening a PR, inspect open PRs for duplicate scope, title, branch purpose, and changed files.
- Close or convert to draft any PR superseded by a later PR in the same workstream.
- Do not re-attempt a fix that was already merged and later reverted without first identifying the regression cause.
- Controlled failure-injection PRs are temporary tests only and must be closed after evidence is captured.
- Self-heal is diagnosis-only and manual; it must never create a PR or push changes automatically.
- A PR is not merge-ready until its required CI gates are green and the branch is mergeable against current `main`.
- Prefer amending the same PR with focused commits over opening follow-up PRs for the same defect.
- Vercel/preview failures caused by provider rate limits are infrastructure noise and must not trigger code changes.

## Merge order
1. Root-cause fix.
2. Verification and evidence.
3. Review and merge.
4. Close superseded experiments.
5. Only then start the next workstream.
