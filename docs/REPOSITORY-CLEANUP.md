# Repository Cleanup

The intended operating model is:

```text
main          production/reference
experimental  single development line
```

Legacy branches should be deleted after their associated PR is closed or merged and no unique commits remain required.

Example cleanup command for a maintainer with Git push permissions:

```bash
git fetch --prune origin
git branch -r
# Verify main and experimental are the only long-lived branches.
git push origin --delete <legacy-branch>
```

Do not delete `main` or `experimental`. Before deleting a branch, verify that its unique commits are already reachable from an approved branch or archived elsewhere.
