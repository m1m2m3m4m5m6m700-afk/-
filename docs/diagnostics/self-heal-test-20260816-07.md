# Self-Heal controlled test 2026-08-16-07

Purpose: simulate a missing package-lock.json on a PR-mode test branch.
Expected: CI failure at Setup Node -> Self-Heal R010 diagnosis -> lockfile generation -> allowlist -> staged diff -> commit -> push -> auto-PR.
