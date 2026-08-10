/**
 * Diff viewer panel — Phase 5 (read-only).
 *
 * Shows the files changed between the write branch and the repo's default
 * branch, with additions/deletions and a redacted unified-diff patch. Secret
 * paths are filtered server-side; patches are redacted server-side.
 *
 * The viewer performs NO actions — it only displays. PR creation is a separate
 * explicit action in the PullRequestPanel.
 */
import { useEffect } from "react";
import { FilePlus, FileMinus, FileEdit, Loader2, RefreshCw, GitCompare } from "lucide-react";
import type { GitHubDiffFile } from "@/lib/github";
import { EmptyBanner, LoadingBanner } from "./StateBanners";

interface DiffViewerPanelProps {
  files: GitHubDiffFile[];
  base: string | null;
  head: string | null;
  loading: boolean;
  hasWriteBranch: boolean;
  onRefresh: () => void;
}

const STATUS_ICON = {
  added: FilePlus,
  removed: FileMinus,
  modified: FileEdit,
  renamed: FileEdit,
} as const;

const STATUS_COLOR = {
  added: "text-emerald-600 dark:text-emerald-400",
  removed: "text-destructive",
  modified: "text-amber-600 dark:text-amber-400",
  renamed: "text-amber-600 dark:text-amber-400",
} as const;

export function DiffViewerPanel({
  files,
  base,
  head,
  loading,
  hasWriteBranch,
  onRefresh,
}: DiffViewerPanelProps) {
  // Auto-load the diff when a write branch is active and the list is empty.
  useEffect(() => {
    if (hasWriteBranch && !loading && files.length === 0) {
      onRefresh();
    }
  }, [hasWriteBranch, loading, files.length, onRefresh]);

  if (!hasWriteBranch) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <GitCompare className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Create a write branch to view its diff against the default branch.
        </p>
      </div>
    );
  }

  if (loading && files.length === 0) {
    return (
      <div className="p-4">
        <LoadingBanner />
      </div>
    );
  }

  const totalAdd = files.reduce((s, f) => s + f.additions, 0);
  const totalDel = files.reduce((s, f) => s + f.deletions, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Changes</h3>
          <p className="font-mono text-xs text-muted-foreground">
            {head} → {base}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +{totalAdd}
            </span>{" "}
            <span className="font-semibold text-destructive">-{totalDel}</span>
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <EmptyBanner what="files" />
      ) : (
        <div className="space-y-2">
          {files.map((f) => {
            const Icon = STATUS_ICON[f.status];
            return (
              <div key={f.path} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <Icon className={`size-4 shrink-0 ${STATUS_COLOR[f.status]}`} />
                  <span className="truncate font-mono text-xs text-foreground">{f.path}</span>
                  <span className="ml-auto shrink-0 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">+{f.additions}</span>{" "}
                    <span className="text-destructive">-{f.deletions}</span>
                  </span>
                </div>
                {f.patch ? (
                  <pre className="max-h-64 overflow-auto bg-muted/30 p-2 text-xs leading-relaxed">
                    <code className="font-mono">{f.patch}</code>
                  </pre>
                ) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No inline patch (binary or too large).
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
