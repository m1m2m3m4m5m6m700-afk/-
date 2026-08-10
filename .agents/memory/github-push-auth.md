---
name: GitHub push authentication
description: Environment-specific behavior for pushing this repository to GitHub.
---

The shell’s HTTPS `git push origin main` may fail because the remote has no usable command-line credentials, while the configured GitHub-managed push succeeds.

**Why:** Replit’s GitHub connection can authenticate pushes separately from the local Git credential helper.

**How to apply:** If a direct shell push reports invalid username or token, use the managed GitHub push operation for the current branch instead of requesting or handling credentials manually.
