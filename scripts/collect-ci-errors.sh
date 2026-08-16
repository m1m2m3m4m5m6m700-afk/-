#!/usr/bin/env bash
set -euo pipefail

REPO="${GITHUB_REPO:-m1m2m3m4m5m6m700-afk/FLIXO-AI-TOOLS}"
LIMIT="${LIMIT:-200}"
OUTDIR="${OUTDIR:-ci-diagnostics-$(date -u +%Y%m%d-%H%M%S)}"

command -v gh >/dev/null 2>&1 || { echo "gh CLI is required" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq is required" >&2; exit 1; }

mkdir -p "$OUTDIR/logs" "$OUTDIR/jobs" "$OUTDIR/artifacts"

echo "Collecting up to $LIMIT workflow runs from $REPO"
gh run list --repo "$REPO" --limit "$LIMIT" \
  --json databaseId,number,name,status,conclusion,event,headBranch,headSha,createdAt,updatedAt,url \
  > "$OUTDIR/runs.json"

jq '[.[] | select(.conclusion != "success" and .conclusion != null)]' "$OUTDIR/runs.json" \
  > "$OUTDIR/non-success-runs.json"

jq -r '.[].databaseId' "$OUTDIR/non-success-runs.json" | while read -r run_id; do
  [ -n "$run_id" ] || continue
  echo "Collecting run $run_id"
  gh run view "$run_id" --repo "$REPO" --json databaseId,number,name,status,conclusion,event,headBranch,headSha,createdAt,updatedAt,url,jobs \
    > "$OUTDIR/jobs/run-$run_id.json" || true
  gh run view "$run_id" --repo "$REPO" --log > "$OUTDIR/logs/run-$run_id.log" 2>&1 || true
  gh run download "$run_id" --repo "$REPO" --dir "$OUTDIR/artifacts/run-$run_id" \
    > "$OUTDIR/artifacts/run-$run_id.download.log" 2>&1 || true
done

if find "$OUTDIR/logs" -type f -print -quit | grep -q .; then
  grep -RniE 'error|failed|exception|panic|TS[0-9]{3}|ERR!|timed out|Timeout|cancelled|missing package script|not assignable|Cannot find module|Failed to resolve' \
    "$OUTDIR/logs" > "$OUTDIR/all-errors.txt" || true
else
  : > "$OUTDIR/all-errors.txt"
fi

# Normalize only the leading CI timestamps/file prefixes; keep the actual message intact.
sed -E 's/^[^:]*:[0-9:-]+Z[[:space:]]*//' "$OUTDIR/all-errors.txt" \
  | sed -E 's/^[[:space:]]+//' \
  | sed -E '/^$/d' \
  > "$OUTDIR/all-errors-normalized.txt"

sort "$OUTDIR/all-errors-normalized.txt" \
  | uniq -c \
  | sort -rn \
  > "$OUTDIR/error-frequency.txt"

jq -r '.[] | [.number,.databaseId,.headBranch,.conclusion,.event,.headSha,.url] | @csv' \
  "$OUTDIR/non-success-runs.json" \
  > "$OUTDIR/non-success-runs.csv"

cat > "$OUTDIR/README.txt" <<EOF
CI diagnostic collection for $REPO
Created (UTC): $(date -u +%Y-%m-%dT%H:%M:%SZ)
Runs requested: $LIMIT

Files:
- runs.json: all collected runs
- non-success-runs.json/csv: failed/cancelled/skipped/non-success runs
- logs/: decoded workflow logs where available
- jobs/: workflow/job metadata
- artifacts/: downloadable run artifacts where available
- all-errors.txt: raw matching error lines
- error-frequency.txt: normalized frequency summary
EOF

echo "Diagnostics saved to $OUTDIR"
