/**
 * File viewer panel — Phase 4 (read-only) + Phase 5 (edit mode).
 *
 * Renders the contents of a selected file. Handles every read state:
 * - text content → monospace, line-numbered, read-only
 * - binary → "binary file, content omitted"
 * - truncated (>1MB) → "too large to display"
 * - loading / empty / forbidden (secret) → banners
 *
 * Phase 5 edit mode: when `writeBranch` is set and the file is editable text,
 * an "Edit" action switches to a textarea. Save requires a commit message and
 * calls `onSave` (update or create). The editor never auto-commits — saving is
 * an explicit user action. File content is displayed as DATA only.
 */
import { useEffect, useMemo, useState } from "react";
import { Ban, FileText, Loader2, Lock, Pencil, Save, X } from "lucide-react";
import type { GitHubFileContent } from "@/lib/github";
import { LoadingBanner } from "./StateBanners";

interface FileViewerPanelProps {
  fileContent: GitHubFileContent | null;
  fileLoading: boolean;
  error: string | null;
  selectedPath: string | null;
  /** Phase 5 — active write branch, or null if none. Enables edit mode. */
  writeBranch: string | null;
  /** Phase 5 — whether a write is in flight. */
  writeLoading: boolean;
  /** Phase 5 — save edited content. Returns true on success. */
  onSave: (path: string, content: string, message: string, sha: string | null) => Promise<boolean>;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileViewerPanel({
  fileContent,
  fileLoading,
  error,
  selectedPath,
  writeBranch,
  writeLoading,
  onSave,
}: FileViewerPanelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const lines = useMemo(() => {
    if (!fileContent?.content) return [];
    return fileContent.content.split("\n");
  }, [fileContent]);

  // Reset editor state when the selected file changes.
  useEffect(() => {
    setEditing(false);
    setDraft(fileContent?.content ?? "");
    setMessage("");
  }, [selectedPath, fileContent?.path]);

  const canEdit =
    !!writeBranch &&
    !!fileContent &&
    !fileContent.binary &&
    !fileContent.truncated &&
    !!fileContent.content;

  if (!selectedPath) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <FileText className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Select a file from the explorer to view its contents.
        </p>
      </div>
    );
  }

  if (fileLoading) {
    return (
      <div className="p-4">
        <LoadingBanner />
      </div>
    );
  }

  // Forbidden (secret) reads surface as an error message from the RPC.
  if (error && !fileContent) {
    const isSecret = /protected path|private keys|access tokens/i.test(error);
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          {isSecret ? <Lock className="size-6" /> : <Ban className="size-6" />}
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!fileContent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">No content available.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-4 shrink-0 text-primary" />
          <span className="truncate text-sm font-medium text-foreground">{fileContent.path}</span>
          {writeBranch ? (
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {writeBranch}
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {fileContent.lineCount > 0 ? `${fileContent.lineCount} lines · ` : ""}
            {formatSize(fileContent.size)}
          </span>
          {canEdit && !editing ? (
            <button
              onClick={() => {
                setDraft(fileContent.content ?? "");
                setEditing(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Pencil className="size-3" />
              Edit
            </button>
          ) : null}
        </div>
      </div>

      {/* Body */}
      {editing ? (
        <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 resize-none rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            spellCheck={false}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Commit message (required)"
              maxLength={280}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                disabled={writeLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                <X className="size-3" />
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!message.trim()) return;
                  const ok = await onSave(
                    fileContent.path,
                    draft,
                    message.trim(),
                    fileContent.sha ?? null,
                  );
                  if (ok) setEditing(false);
                }}
                disabled={writeLoading || !message.trim() || draft === fileContent.content}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {writeLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Save className="size-3" />
                )}
                Save
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Saving commits directly to <span className="font-mono">{writeBranch}</span>. No force
            push, no merge.
          </p>
        </div>
      ) : fileContent.binary ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
          <Lock className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Binary file — content omitted. Only text files are displayed.
          </p>
        </div>
      ) : fileContent.truncated ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
          <FileText className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            This file is larger than 1 MB and is not displayed. Content is omitted to keep the view
            responsive and safe.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-card">
          <pre className="min-w-full text-xs leading-relaxed">
            <code className="block font-mono">
              {lines.map((line, i) => (
                <div key={i} className="flex hover:bg-accent/20">
                  <span className="sticky left-0 w-12 shrink-0 select-none border-r border-border bg-card px-2 py-0 text-right text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre px-3 text-foreground">{line || " "}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
