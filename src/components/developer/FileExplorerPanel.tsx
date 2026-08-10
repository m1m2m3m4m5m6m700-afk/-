/**
 * File Explorer panel — Phase 4 (read-only).
 *
 * Shows the repository file tree and an integrated code-search bar. Selecting
 * a file reads its contents (secrets-guarded server-side) and hands the result
 * to the parent for display in the FileViewerPanel. Search results replace the
 * tree view while a search is active.
 *
 * No file is ever editable here — this panel is strictly read-only. Secret
 * paths never appear in the tree (filtered server-side); reading a protected
 * path returns a `forbidden` failure surfaced as a banner, never its contents.
 */
import { useEffect, useMemo, useState } from "react";
import {
  File,
  FileCode,
  FileText,
  Folder,
  FolderOpen,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import type { GitHubFileTreeNode } from "@/lib/github";
import { EmptyBanner, LoadingBanner } from "./StateBanners";

interface FileExplorerPanelProps {
  files: GitHubFileTreeNode[];
  filesTruncated: boolean;
  filesLoading: boolean;
  searchLoading: boolean;
  selectedPath: string | null;
  onRefresh: () => void;
  onSelectFile: (path: string) => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}

/** A nested tree built from flat GitHub tree paths. */
interface TreeNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  size: number;
  children: TreeNode[];
}

function buildTree(nodes: GitHubFileTreeNode[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const node of nodes) {
    const parts = node.path.split("/");
    let level = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join("/");
      let existing = level.find((n) => n.name === name);
      if (!existing) {
        existing = {
          name,
          path,
          type: isLast ? node.type : "tree",
          size: isLast ? node.size : 0,
          children: [],
        };
        level.push(existing);
      }
      if (isLast) {
        existing.type = node.type;
        existing.size = node.size;
      } else {
        level = existing.children;
      }
    }
  }
  // Sort: directories first, then files, alphabetically.
  const sortRec = (arr: TreeNode[]) => {
    arr.sort((a, b) => {
      if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    arr.forEach((n) => sortRec(n.children));
  };
  sortRec(root);
  return root;
}

function fileIcon(name: string, className: string) {
  if (/\.(tsx?|jsx?|mjs|cjs|json|ya?ml|toml)$/i.test(name))
    return <FileCode className={className} />;
  if (/\.(md|txt|rst)$/i.test(name)) return <FileText className={className} />;
  return <File className={className} />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TreeRow({
  node,
  depth,
  selectedPath,
  onSelectFile,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const pad = { paddingLeft: `${depth * 14 + 12}px` };

  if (node.type === "tree") {
    return (
      <li>
        <button
          onClick={() => setOpen((v) => !v)}
          style={pad}
          className="flex w-full items-center gap-2 py-1.5 pr-3 text-sm text-foreground transition-colors hover:bg-accent/40"
        >
          {open ? (
            <FolderOpen className="size-4 text-primary" />
          ) : (
            <Folder className="size-4 text-primary" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {open ? (
          <ul>
            {node.children.map((child) => (
              <TreeRow
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  const selected = node.path === selectedPath;
  return (
    <li>
      <button
        onClick={() => onSelectFile(node.path)}
        style={pad}
        className={`flex w-full items-center gap-2 py-1.5 pr-3 text-sm transition-colors ${
          selected ? "bg-primary/15 font-medium text-primary" : "text-foreground hover:bg-accent/40"
        }`}
      >
        {fileIcon(node.name, "size-4 shrink-0 text-muted-foreground")}
        <span className="truncate">{node.name}</span>
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
          {formatSize(node.size)}
        </span>
      </button>
    </li>
  );
}

export function FileExplorerPanel({
  files,
  filesTruncated,
  filesLoading,
  searchLoading,
  selectedPath,
  onRefresh,
  onSelectFile,
  onSearch,
  onClearSearch,
}: FileExplorerPanelProps) {
  const [query, setQuery] = useState("");

  // Auto-load the tree when the panel first mounts with an empty list.
  useEffect(() => {
    if (files.length === 0 && !filesLoading) onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tree = useMemo(() => buildTree(files), [files]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length >= 2) onSearch(q);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">File Explorer</h2>
          <p className="text-sm text-muted-foreground">
            Browse and read files. Read-only — no edits in Phase 4.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={filesLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          <RefreshCw className={`size-3.5 ${filesLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Integrated code search */}
      <form onSubmit={submitSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code in this repo…"
            minLength={2}
            maxLength={256}
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={searchLoading || query.trim().length < 2}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {searchLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Search className="size-3.5" />
          )}
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onClearSearch();
          }}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Clear search"
          title="Clear search"
        >
          <X className="size-4" />
        </button>
      </form>

      {filesTruncated ? (
        <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
          The repository has more files than shown — the tree was truncated to keep the view fast.
        </p>
      ) : null}

      {filesLoading && files.length === 0 ? (
        <LoadingBanner />
      ) : files.length === 0 ? (
        <EmptyBanner what="files" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {tree.map((node) => (
              <TreeRow
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
