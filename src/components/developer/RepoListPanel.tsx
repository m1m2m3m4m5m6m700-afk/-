/**
 * Repository list panel.
 *
 * Renders the real list of repositories returned by the GitHub RPC. Each row is
 * a button that selects the repo (writing the selection into the HttpOnly
 * session cookie server-side via `selectRepo`). Repos the user can push to are
 * surfaced first; private repos are marked.
 *
 * No fake data: if the list is empty, an EmptyBanner is shown. If the RPC
 * failed, the matching state banner is shown by the parent shell.
 */
import { useEffect } from "react";
import { GitFork, Lock, RefreshCw, Star } from "lucide-react";
import type { GitHubRepository } from "@/lib/github";
import { EmptyBanner, LoadingBanner } from "./StateBanners";

interface RepoListPanelProps {
  repos: GitHubRepository[];
  loading: boolean;
  onRefresh: () => void;
  onSelect: (repo: string, defaultBranch: string) => void;
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const day = 1000 * 60 * 60 * 24;
  if (diff < day) return "today";
  if (diff < day * 30) return `${Math.floor(diff / day)}d ago`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))}mo ago`;
  return `${Math.floor(diff / (day * 365))}y ago`;
}

export function RepoListPanel({ repos, loading, onRefresh, onSelect }: RepoListPanelProps) {
  // Auto-load when first mounted with an empty list.
  useEffect(() => {
    if (repos.length === 0 && !loading) onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && repos.length === 0) {
    return <LoadingBanner />;
  }
  if (repos.length === 0) {
    return <EmptyBanner what="repositories" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Repositories</h2>
          <p className="text-sm text-muted-foreground">
            Choose a repository to inspect its branches and latest commit.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {repos.map((repo) => (
          <li key={repo.id}>
            <button
              onClick={() => onSelect(repo.fullName, repo.defaultBranch)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground">
                {repo.private ? <Lock className="size-4" /> : <GitFork className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {repo.fullName}
                  </span>
                  {repo.permissions.push ? (
                    <Star className="size-3.5 shrink-0 text-primary" />
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {repo.description ?? "No description"}
                  {" · default "}
                  <span className="font-medium">{repo.defaultBranch}</span>
                  {" · updated "}
                  {timeAgo(repo.updatedAt)}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {repo.permissions.push ? "writable" : "read"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
