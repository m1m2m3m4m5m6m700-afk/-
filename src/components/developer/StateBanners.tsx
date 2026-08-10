/**
 * State banners for the Developer Workspace.
 *
 * Every non-success state the workspace can show renders through one of these.
 * No banner ever displays fake GitHub data, tokens, or secrets — they only
 * describe the real state returned by the GitHub RPC layer.
 */
import type { ReactNode } from "react";
import { AlertTriangle, Ban, Clock, KeyRound, Settings, SearchX } from "lucide-react";
import type { GitHubErrorKind } from "@/lib/github";

interface BannerProps {
  title: string;
  description: string;
  icon: ReactNode;
  tone: "muted" | "warning" | "danger" | "info";
  action?: ReactNode;
}

const toneStyles: Record<BannerProps["tone"], string> = {
  muted: "border-border bg-surface text-surface-foreground",
  warning: "border-accent/40 bg-accent/10 text-accent-foreground",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-primary/30 bg-primary/10 text-primary",
};

function Banner({ title, description, icon, tone, action }: BannerProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-6 sm:flex-row sm:items-center sm:gap-4 ${toneStyles[tone]}`}
      role="status"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/60">
        {icon}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Initial load of auth status. */
export function LoadingBanner() {
  return (
    <Banner
      title="Connecting to your workspace"
      description="Reading your GitHub session. This only takes a moment."
      icon={<Clock className="size-5 animate-pulse" />}
      tone="info"
    />
  );
}

/**
 * GitHub App credentials are missing on the server. NO fake data is shown —
 * the workspace stays empty until the operator configures the GitHub App.
 */
export function NotConfiguredBanner() {
  return (
    <Banner
      title="GitHub is not configured"
      description="This Flixo instance has not been connected to a GitHub App yet. No repositories, branches, or commits will be shown until an operator adds the GitHub credentials on the server. This is intentional — no placeholder data is displayed."
      icon={<Settings className="size-5" />}
      tone="muted"
    />
  );
}

/** Session missing or token cache lost (server restart). */
export function AuthRequiredBanner({
  onConnect,
  reason = "auth",
}: {
  onConnect: () => void;
  reason?: "auth" | "expired";
}) {
  return (
    <Banner
      title={reason === "expired" ? "Reconnect GitHub" : "Connect your GitHub account"}
      description={
        reason === "expired"
          ? "Your session expired (the server may have restarted). Reconnect to continue. No credentials are stored in your browser — the session lives in a secure HttpOnly cookie."
          : "Sign in with GitHub to browse your repositories and branches. Authorization happens through a GitHub App — no personal access tokens, nothing stored in localStorage."
      }
      icon={<KeyRound className="size-5" />}
      tone="warning"
      action={
        <button
          onClick={onConnect}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Connect GitHub
        </button>
      }
    />
  );
}

/** No repos / branches / files / matches found — a real empty result, not a missing one. */
export function EmptyBanner({ what }: { what: "repositories" | "branches" | "files" | "matches" }) {
  const description: Record<string, string> = {
    repositories:
      "Your account has no repositories the app can access, or none match the current filters.",
    branches: "This repository has no branches to display.",
    files: "This repository has no files to display, or the tree could not be loaded.",
    matches: "No code matches your query. Try different terms.",
  };
  return (
    <Banner
      title={`No ${what} found`}
      description={description[what]}
      icon={<SearchX className="size-5" />}
      tone="muted"
    />
  );
}

/** GitHub API returned a recoverable rate-limit. */
export function RateLimitedBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <Banner
      title="GitHub rate limit reached"
      description="GitHub is throttling requests. Wait a short while and try again."
      icon={<Clock className="size-5" />}
      tone="warning"
      action={
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Retry
        </button>
      }
    />
  );
}

/** Generic GitHub API error (provider unreachable, forbidden, unknown). */
export function ApiErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Banner
      title="GitHub request failed"
      description={message}
      icon={<AlertTriangle className="size-5" />}
      tone="danger"
      action={
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Retry
        </button>
      }
    />
  );
}

/** Operation refused by the secrets guard or denied by GitHub. */
export function ForbiddenBanner({ message }: { message: string }) {
  return (
    <Banner
      title="Access refused"
      description={message}
      icon={<Ban className="size-5" />}
      tone="danger"
    />
  );
}

/**
 * Map a GitHub failure kind to the right banner. Returns `null` when the kind
 * is one the caller already handles (e.g. `not_configured`, `not_authenticated`
 * handled by the shell). Callers pass an `onRetry` + `onConnect` to wire actions.
 */
export function failureBanner(
  kind: GitHubErrorKind,
  message: string,
  actions: { onRetry: () => void; onConnect: () => void },
): ReactNode {
  switch (kind) {
    case "rate_limited":
      return <RateLimitedBanner onRetry={actions.onRetry} />;
    case "not_authenticated":
    case "auth_required":
      return <AuthRequiredBanner onConnect={actions.onConnect} reason="expired" />;
    case "not_configured":
      return <NotConfiguredBanner />;
    case "forbidden":
      return <ForbiddenBanner message={message} />;
    case "conflict":
      return <ApiErrorBanner message={message} onRetry={actions.onRetry} />;
    case "provider_unreachable":
    case "not_found":
    case "validation":
    case "repo_not_selected":
    case "unknown":
    default:
      return <ApiErrorBanner message={message} onRetry={actions.onRetry} />;
  }
}
