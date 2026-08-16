# Self-Heal auto-fix branch cleanup

The scheduled workflow prunes stale `auto-fix/*` branches every Sunday at 03:17 UTC.

Policy:
- Only branches under `refs/heads/auto-fix/` are eligible.
- Branches older than 30 days are eligible for deletion.
- A branch with an open PR is never deleted.
- The workflow does not modify `main`, `src/**`, or pull requests.
- Cleanup results are written to the workflow summary rather than committed back to the repository.

This keeps the repository free of abandoned automation branches without creating a recurring commit or requiring a separate PAT.
