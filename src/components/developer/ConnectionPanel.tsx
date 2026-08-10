/**
 * Connection panel — the "not yet authenticated" state of the workspace.
 *
 * Shown when GitHub is configured but the user has not connected (or their
 * session expired). Offers a single Connect button that redirects to the
 * GitHub OAuth web flow (server-side, via the existing `useGitHub` hook).
 *
 * Security notes shown to the user: no PATs, HttpOnly cookie, no localStorage
 * credentials. These are statements about the architecture, not data.
 */
import { Github, KeyRound, Lock, ShieldCheck } from "lucide-react";
import type { GitHubAuthStatus } from "@/lib/github";

interface ConnectionPanelProps {
  status: GitHubAuthStatus;
  onConnect: () => void;
  connecting: boolean;
}

export function ConnectionPanel({ status, onConnect, connecting }: ConnectionPanelProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-24">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface text-foreground">
        <Github className="size-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Connect your GitHub account
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Authorize the Flixo GitHub App to browse your repositories and branches. This is the
          foundation for the AI developer workflow — file editing, branches, and pull requests come
          in later phases.
        </p>
      </div>

      <button
        onClick={onConnect}
        disabled={connecting}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Github className="size-4" />
        {connecting ? "Redirecting…" : "Connect with GitHub"}
      </button>

      <div className="grid w-full gap-3 text-left sm:grid-cols-3">
        <SecurityNote
          icon={<KeyRound className="size-4" />}
          title="No PATs"
          body="Authorization uses a GitHub App, never a personal access token."
        />
        <SecurityNote
          icon={<Lock className="size-4" />}
          title="HttpOnly session"
          body="Your session cookie is HttpOnly — JavaScript cannot read it."
        />
        <SecurityNote
          icon={<ShieldCheck className="size-4" />}
          title="Server-side only"
          body="All GitHub API calls run on the Flixo server, not in your browser."
        />
      </div>

      {status.login ? (
        <p className="text-xs text-muted-foreground">
          Last signed in as <span className="font-medium text-foreground">{status.login}</span>.
        </p>
      ) : null}
    </div>
  );
}

function SecurityNote({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-1 flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
