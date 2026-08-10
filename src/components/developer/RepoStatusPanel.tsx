/**
 * Repository status panel — the "repo selected" state.
 *
 * Shows: selected repo name + default branch, the branches list (selectable),
 * the last commit on the selected branch, and branch-protection flag. GitBranch
 * selection writes to the HttpOnly session cookie via `selectRepo` (same repo,
 * new branch) and refreshes the summary.
 *
 * No write operations (create branch, commit, push, PR) — those are Phase 5.
 */
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  GitBranch,
  Calendar,
  GitCommit,
  Lock,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import type { GitHubAuthStatus, GitHubBranch, GitHubRepoSummary } from "@/lib/github";
import { EmptyBanner, LoadingBanner } from "./StateBanners";

interface RepoStatusPanelProps {
  status: GitHubAuthStatus;
  branches: GitHubBranch[];
  branchesLoading: boolean;
  summary: GitHubRepoSummary | null;
  summaryLoading: boolean;
  onRefreshBranches: () => void;
  onRefreshSummary: () => void;
  onSelectBranch: (repo: string, branch: string) => void;
  onBack: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function RepoStatusPanel({
  status,
  branches,
  branchesLoading,
  summary,
  summaryLoading,
  onRefreshBranches,
  onRefreshSummary,
  onSelectBranch,
  onBack,
}: RepoStatusPanelProps) {
  const repo = status.selectedRepo!;
  const selectedBranch = status.selectedBranch ?? summary?.selectedBranch ?? null;
  const [pickingBranch, setPickingBranch] = useState(false);

  // Auto-load branches + summary when the panel mounts or the repo changes.
  useEffect(() => {
    onRefreshBranches();
    onRefreshSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Change repository
          </button>
          <h2 className="truncate text-xl font-bold tracking-tight text-foreground">{repo}</h2>
          <p className="text-sm text-muted-foreground">
            Default branch:{" "}
            <span className="font-medium text-foreground">{summary?.defaultBranch ?? "—"}</span>
          </p>
        </div>
        <button
          onClick={() => {
            onRefreshBranches();
            onRefreshSummary();
          }}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent"
          aria-label="Refresh repository"
          title="Refresh"
        >
          <RefreshCw
            className={`size-4 ${branchesLoading || summaryLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Branches */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Branches</h3>
            </div>
            {selectedBranch ? (
              <button
                onClick={() => setPickingBranch((v) => !v)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                {selectedBranch}
              </button>
            ) : null}
          </div>

          {branchesLoading && branches.length === 0 ? (
            <LoadingBanner />
          ) : branches.length === 0 ? (
            <EmptyBanner what="branches" />
          ) : pickingBranch || !selectedBranch ? (
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {branches.map((b) => {
                const active = b.name === selectedBranch;
                return (
                  <li key={b.name}>
                    <button
                      onClick={() => {
                        setPickingBranch(false);
                        onSelectBranch(repo, b.name);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-primary/15 font-semibold text-primary"
                          : "text-foreground hover:bg-accent/40"
                      }`}
                    >
                      <GitBranch className="size-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{b.name}</span>
                      {b.protected ? (
                        <ShieldCheck className="ml-auto size-3.5 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Current: <span className="font-medium text-foreground">{selectedBranch}</span>
              </p>
              <button
                onClick={() => setPickingBranch(true)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Switch branch ({branches.length})
              </button>
            </div>
          )}
        </section>

        {/* Last commit + protection */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <GitCommit className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Latest commit</h3>
          </div>
          {summaryLoading && !summary ? (
            <LoadingBanner />
          ) : summary?.lastCommit ? (
            <div className="space-y-2 text-sm">
              <p className="break-words font-medium text-foreground">
                {summary.lastCommit.message.split("\n")[0]}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <GitCommit className="size-3" />
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                    {shortSha(summary.lastCommit.sha)}
                  </code>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Lock className="size-3" />
                  {summary.lastCommit.author}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(summary.lastCommit.date)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No commit information available.</p>
          )}

          <div className="flex items-center gap-2 border-t border-border pt-3 text-xs">
            {summary?.branchProtected ? (
              <>
                <ShieldCheck className="size-4 text-primary" />
                <span className="font-medium text-foreground">Branch is protected</span>
              </>
            ) : (
              <>
                <ShieldOff className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Branch is not protected</span>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Future-sections teaser — clearly disabled, not interactive */}
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          File explorer, AI assistant, diff viewer, verification, and pull-request controls arrive
          in later phases. This panel is read-only for now.
        </p>
      </div>
    </div>
  );
}
