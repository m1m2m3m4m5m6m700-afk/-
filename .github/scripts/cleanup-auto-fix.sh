#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_TOKEN:?GITHUB_TOKEN is required}"

THRESHOLD_DAYS=30
REPO="$GITHUB_REPOSITORY"
NOW_TS="$(date +%s)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

OPEN_PR_BRANCHES="$TMP_DIR/open-pr-branches.txt"
ALL_BRANCHES="$TMP_DIR/auto-fix-branches.txt"

printf '%s\n' "$(date -Iseconds) starting auto-fix branch cleanup" >> "$GITHUB_STEP_SUMMARY"

gh pr list --repo "$REPO" --state open --limit 100 --json headRefName --jq '.[].headRefName' > "$OPEN_PR_BRANCHES"
gh api --paginate "repos/$REPO/branches?per_page=100" --jq '.[].name' \
  | awk '/^auto-fix\// {print}' \
  > "$ALL_BRANCHES"

while IFS= read -r branch; do
  [ -z "$branch" ] && continue

  if grep -Fxq "$branch" "$OPEN_PR_BRANCHES"; then
    echo "Keeping $branch: open PR exists." >> "$GITHUB_STEP_SUMMARY"
    continue
  fi

  updated="$(gh api "repos/$REPO/commits/$branch" --jq '.commit.committer.date' 2>/dev/null || true)"
  if [ -z "$updated" ]; then
    echo "Skipping $branch: commit metadata unavailable." >> "$GITHUB_STEP_SUMMARY"
    continue
  fi

  updated_ts="$(date -d "$updated" +%s 2>/dev/null || echo 0)"
  if [ "$updated_ts" -le 0 ]; then
    echo "Skipping $branch: could not parse commit date." >> "$GITHUB_STEP_SUMMARY"
    continue
  fi

  age_days=$(( (NOW_TS - updated_ts) / 86400 ))
  if [ "$age_days" -gt "$THRESHOLD_DAYS" ]; then
    gh api --method DELETE "repos/$REPO/git/refs/heads/$branch"
    echo "Deleted $branch (age ${age_days}d, no open PR)." >> "$GITHUB_STEP_SUMMARY"
  else
    echo "Keeping $branch (age ${age_days}d)." >> "$GITHUB_STEP_SUMMARY"
  fi
done < "$ALL_BRANCHES"

printf '%s\n' "$(date -Iseconds) cleanup finished" >> "$GITHUB_STEP_SUMMARY"
