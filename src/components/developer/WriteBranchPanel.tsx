/**
 * Write branch panel — Phase 5.
 *
 * Lets the user create an `ai/<slug>` branch off the repo's default branch and
 * see the active write branch. This is the gate for all Phase 5 writes: until a
 * write branch exists, create/update/delete are refused server-side.
 *
 * The slug is validated client-side (server re-validates strictly). No user
 * sensitive data is embedded in the branch name.
 */
import { useState } from "react";
import { GitBranch, Loader2, Plus } from "lucide-react";

interface WriteBranchPanelProps {
  /** Active write branch, or null. */
  writeBranch: string | null;
  /** Default branch to branch off (e.g. "main"). */
  defaultBranch: string | null;
  loading: boolean;
  /** Create an ai/<slug> branch off the base. Returns true on success. */
  onCreate: (slug: string, baseBranch: string) => Promise<boolean>;
}

const SLUG_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,79}$/;

export function WriteBranchPanel({
  writeBranch,
  defaultBranch,
  loading,
  onCreate,
}: WriteBranchPanelProps) {
  const [slug, setSlug] = useState("");
  const base = defaultBranch ?? "main";
  const valid = SLUG_RE.test(slug.trim());

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <GitBranch className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Write branch</h3>
      </div>

      {writeBranch ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
            <GitBranch className="size-4 text-primary" />
            <span className="font-mono text-sm text-foreground">{writeBranch}</span>
            <span className="ml-auto rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              active
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            All writes land on this branch. No force push, no merge. Create a new branch to switch.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Create a dedicated <span className="font-mono">ai/&lt;slug&gt;</span> branch off{" "}
            <span className="font-mono">{base}</span> to enable file editing. Writes never touch the
            default branch.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-3">
              <span className="font-mono text-xs text-muted-foreground">ai/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-change"
                maxLength={80}
                className="flex-1 bg-transparent py-1.5 font-mono text-sm text-foreground focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (valid) void onCreate(slug.trim(), base);
              }}
              disabled={loading || !valid}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create
            </button>
          </div>
          {!slug.trim() ? null : !valid ? (
            <p className="text-xs text-destructive">
              Use 2–80 letters, numbers, hyphens, dots, or underscores.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
