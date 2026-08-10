/**
 * Developer workspace top bar.
 *
 * Self-contained (the /developer route does NOT use SiteLayout, so it brings
 * its own chrome). Renders the Flixo wordmark, the live GitHub connection
 * pill, and a theme toggle wired to the root ThemeProvider.
 *
 * No GitHub tokens or credentials appear here — only the public login +
 * connection state from the GitHub auth status.
 */
import { Link } from "@tanstack/react-router";
import { Github, Moon, Sun, Terminal } from "lucide-react";
import { useTheme } from "@/lib/theme";
import type { GitHubAuthStatus } from "@/lib/github";

interface DeveloperTopbarProps {
  status: GitHubAuthStatus | null;
  loading: boolean;
}

function ConnectionPill({ status, loading }: DeveloperTopbarProps) {
  if (loading || !status) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-muted-foreground" />
        Checking…
      </span>
    );
  }
  if (!status.configured) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground" />
        Not configured
      </span>
    );
  }
  if (!status.authenticated) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="size-2 rounded-full bg-accent" />
        Disconnected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      <span className="size-2 rounded-full bg-primary" />
      Connected{status.login ? ` · ${status.login}` : ""}
    </span>
  );
}

export function DeveloperTopbar({ status, loading }: DeveloperTopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Terminal className="size-4" />
          </span>
          Flixo<span className="text-muted-foreground"> / Developer</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ConnectionPill status={status} loading={loading} />
        <a
          href="https://docs.github.com/en/apps"
          target="_blank"
          rel="noreferrer noopener"
          className="hidden size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          aria-label="GitHub Apps documentation"
          title="GitHub Apps docs"
        >
          <Github className="size-4" />
        </a>
        <button
          onClick={toggleTheme}
          className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  );
}
