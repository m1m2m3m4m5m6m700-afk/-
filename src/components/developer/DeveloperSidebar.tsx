/**
 * Developer workspace sidebar.
 *
 * "Repository" and "File Explorer" are enabled (Phase 4 adds read-only file
 * browsing + code search). The remaining sections are disabled placeholders so
 * the workspace communicates its future shape (AI Assistant, Diff Viewer,
 * Verification, Git/PR, Audit Log) WITHOUT implementing them — they are clearly
 * non-interactive.
 *
 * The sidebar is collapsible on small screens via a controlled `open` prop.
 */
import { useEffect } from "react";
import {
  FolderGit2,
  FolderTree,
  Bot,
  GitCompare,
  ShieldCheck,
  GitPullRequest,
  ScrollText,
  X,
} from "lucide-react";

export type WorkspaceView = "repository" | "files" | "diff" | "pr";

interface NavItem {
  id: string;
  label: string;
  icon: typeof FolderGit2;
  enabled: boolean;
  hint: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "repository", label: "Repository", icon: FolderGit2, enabled: true, hint: "" },
  { id: "files", label: "File Explorer", icon: FolderTree, enabled: true, hint: "Phase 4" },
  { id: "diff", label: "Diff Viewer", icon: GitCompare, enabled: true, hint: "Phase 5" },
  { id: "pr", label: "Git / Pull Request", icon: GitPullRequest, enabled: true, hint: "Phase 5" },
  { id: "ai", label: "AI Assistant", icon: Bot, enabled: false, hint: "Phase 6" },
  { id: "verify", label: "Verification", icon: ShieldCheck, enabled: false, hint: "Phase 5" },
  { id: "audit", label: "Audit Log", icon: ScrollText, enabled: false, hint: "Phase 6" },
];

interface DeveloperSidebarProps {
  open: boolean;
  onClose: () => void;
  activeView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
}

export function DeveloperSidebar({
  open,
  onClose,
  activeView,
  onViewChange,
}: DeveloperSidebarProps) {
  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Mobile backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4 lg:hidden">
          <span className="text-sm font-semibold">Navigation</span>
          <button
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.enabled) {
              const active = item.id === activeView;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as WorkspaceView);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-sidebar-primary/15 text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </button>
              );
            }
            return (
              <span
                key={item.id}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
                title={`${item.label} — coming in ${item.hint}`}
                aria-disabled
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  {item.hint}
                </span>
              </span>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Phase 5 · Read + write (controlled) + PR + diff. AI agent, verification automation, and
            audit log arrive in Phase 6. Merge is not available.
          </p>
        </div>
      </aside>
    </>
  );
}
