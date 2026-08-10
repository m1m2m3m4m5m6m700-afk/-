/**
 * Search results panel — Phase 4 (read-only).
 *
 * Shows code-search matches returned by the GitHub search API. Each match is a
 * file path + a redacted text fragment. Selecting a match reads that file
 * (secrets-guarded server-side) for display in the FileViewerPanel.
 *
 * Secret paths never appear here (filtered server-side), and secret-looking
 * fragments are redacted server-side before they reach this panel.
 */
import { FileCode, Loader2, Search } from "lucide-react";
import type { GitHubSearchResult } from "@/lib/github";
import { EmptyBanner, LoadingBanner } from "./StateBanners";

interface SearchResultsPanelProps {
  searchResult: GitHubSearchResult | null;
  searchLoading: boolean;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

export function SearchResultsPanel({
  searchResult,
  searchLoading,
  selectedPath,
  onSelectFile,
}: SearchResultsPanelProps) {
  if (searchLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="size-4" />
          Searching…
        </div>
        <LoadingBanner />
      </div>
    );
  }

  if (!searchResult) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <Search className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Enter a query to search this repository's code.
        </p>
      </div>
    );
  }

  if (searchResult.matches.length === 0) {
    return <EmptyBanner what="matches" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {searchResult.totalCount} {searchResult.totalCount === 1 ? "match" : "matches"}
        </p>
        {searchResult.truncated ? (
          <span className="text-xs text-muted-foreground">Showing first results — more exist.</span>
        ) : null}
      </div>
      <ul className="space-y-1.5">
        {searchResult.matches.map((match) => {
          const selected = match.path === selectedPath;
          return (
            <li key={match.path}>
              <button
                onClick={() => onSelectFile(match.path)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  selected
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-card hover:bg-accent/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCode className="size-4 shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium text-foreground">{match.path}</span>
                </div>
                {match.fragment ? (
                  <pre className="mt-1 overflow-x-auto rounded bg-surface px-2 py-1 text-xs text-muted-foreground">
                    <code className="whitespace-pre font-mono">{match.fragment}</code>
                  </pre>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
