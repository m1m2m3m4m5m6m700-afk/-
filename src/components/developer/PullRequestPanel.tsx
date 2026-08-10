/**
 * Pull request panel — Phase 5.
 *
 * Lets the user open a PR from the active write branch into the repo's default
 * branch (base fetched server-side). Requires a title + optional body. The PR
 * is opened only on explicit user action — never automatically.
 *
 * NO merge button or action is exposed here. Merge is out of Phase 5 scope.
 */
import { useState } from "react";
import { ExternalLink, GitPullRequest, Loader2 } from "lucide-react";
import type { GitHubPullRequest } from "@/lib/github";

interface PullRequestPanelProps {
  hasWriteBranch: boolean;
  writeBranch: string | null;
  defaultBranch: string | null;
  /** Existing open PR (if any). */
  pullRequest: GitHubPullRequest | null;
  loading: boolean;
  /** Open a PR. Returns true on success. */
  onCreate: (title: string, body: string) => Promise<boolean>;
}

export function PullRequestPanel({
  hasWriteBranch,
  writeBranch,
  defaultBranch,
  pullRequest,
  loading,
  onCreate,
}: PullRequestPanelProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  if (!hasWriteBranch) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <GitPullRequest className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Create a write branch first to open a pull request.
        </p>
      </div>
    );
  }

  if (pullRequest) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <GitPullRequest className="size-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">
            Pull request #{pullRequest.number}
          </h3>
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            {pullRequest.state}
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground">{pullRequest.title}</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {pullRequest.head} → {pullRequest.base}
        </p>
        <a
          href={pullRequest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLink className="size-3" />
          Open on GitHub
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          Merging is not available here. Review and merge on GitHub if desired.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <GitPullRequest className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Open a pull request</h3>
      </div>
      <p className="mb-3 font-mono text-xs text-muted-foreground">
        {writeBranch} → {defaultBranch ?? "default"}
      </p>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="PR title (required)"
          maxLength={280}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Description (optional)"
          maxLength={65000}
          rows={5}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={() => {
            if (title.trim()) void onCreate(title.trim(), body);
          }}
          disabled={loading || !title.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GitPullRequest className="size-4" />
          )}
          Open pull request
        </button>
        <p className="text-xs text-muted-foreground">
          The PR opens from your write branch into the repo default branch. No merge is performed.
        </p>
      </div>
    </div>
  );
}
