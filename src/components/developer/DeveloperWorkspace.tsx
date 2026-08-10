/**
 * DeveloperWorkspace — the top-level shell for the /developer route.
 *
 * Owns the state machine that decides which sub-panel renders:
 *
 *   loading                          → LoadingBanner
 *   !status.configured               → NotConfiguredBanner  (NO fake data)
 *   configured && !authenticated     → ConnectionPanel
 *   authenticated && !selectedRepo   → RepoListPanel
 *   authenticated && selectedRepo    → RepoStatusPanel
 *
 * Every GitHub failure returned by a sub-panel RPC is mapped to the right
 * state banner (rate-limited, auth-required, API error, …) via `failureBanner`.
 *
 * The workspace is self-contained (no SiteLayout) so it stays independent of
 * the marketing site. It reuses the root ThemeProvider for dark/light mode.
 *
 * Security: no tokens or secrets are ever read into React state — the
 * `useGitHub` hook only ever holds public shapes (repo names, branch names,
 * commit metadata). The session cookie is HttpOnly and never touches JS.
 */
import { useState } from "react";
import { Menu } from "lucide-react";
import { useGitHub } from "@/lib/github";
import { DeveloperTopbar } from "./DeveloperTopbar";
import { DeveloperSidebar, type WorkspaceView } from "./DeveloperSidebar";
import { ConnectionPanel } from "./ConnectionPanel";
import { RepoListPanel } from "./RepoListPanel";
import { RepoStatusPanel } from "./RepoStatusPanel";
import { FileExplorerPanel } from "./FileExplorerPanel";
import { FileViewerPanel } from "./FileViewerPanel";
import { SearchResultsPanel } from "./SearchResultsPanel";
import { WriteBranchPanel } from "./WriteBranchPanel";
import { DiffViewerPanel } from "./DiffViewerPanel";
import { PullRequestPanel } from "./PullRequestPanel";
import { LoadingBanner, NotConfiguredBanner, failureBanner } from "./StateBanners";

export function DeveloperWorkspace() {
  const gh = useGitHub();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<WorkspaceView>("repository");
  const [searchActive, setSearchActive] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const status = gh.status;

  // 1. Initial status load.
  if (gh.loading || !status) {
    return (
      <WorkspaceFrame
        status={null}
        loading
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        view={view}
        onViewChange={setView}
      >
        <div className="mx-auto max-w-3xl px-4 py-16">
          <LoadingBanner />
        </div>
      </WorkspaceFrame>
    );
  }

  // 2. GitHub App not configured — show a clear banner, never fake data.
  if (!status.configured) {
    return (
      <WorkspaceFrame
        status={status}
        loading={false}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        view={view}
        onViewChange={setView}
      >
        <div className="mx-auto max-w-3xl px-4 py-16">
          <NotConfiguredBanner />
        </div>
      </WorkspaceFrame>
    );
  }

  // 3. Configured but not authenticated — Connect panel.
  if (!status.authenticated) {
    return (
      <WorkspaceFrame
        status={status}
        loading={false}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        view={view}
        onViewChange={setView}
      >
        <ConnectionPanel status={status} onConnect={gh.connect} connecting={false} />
      </WorkspaceFrame>
    );
  }

  // 4. Authenticated but no repo selected — repo list.
  if (!status.selectedRepo) {
    return (
      <WorkspaceFrame
        status={status}
        loading={false}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        view={view}
        onViewChange={setView}
      >
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
          {gh.error && !gh.reposLoading ? (
            <div className="mb-4">
              {failureBanner("unknown", gh.error, {
                onRetry: gh.refreshRepos,
                onConnect: gh.connect,
              })}
            </div>
          ) : null}
          <RepoListPanel
            repos={gh.repos}
            loading={gh.reposLoading}
            onRefresh={gh.refreshRepos}
            onSelect={(repo, defaultBranch) => gh.selectRepo(repo, defaultBranch)}
          />
        </div>
      </WorkspaceFrame>
    );
  }

  // 5. Authenticated + repo selected.
  //    View "repository" → RepoStatusPanel.
  //    View "files" → File Explorer + viewer + search (Phase 4, read-only).
  return (
    <WorkspaceFrame
      status={status}
      loading={false}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      view={view}
      onViewChange={setView}
    >
      {view === "repository" ? (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
          {gh.error && !gh.branchesLoading && !gh.repoSummaryLoading ? (
            <div className="mb-4">
              {failureBanner("unknown", gh.error, {
                onRetry: () => {
                  gh.refreshBranches();
                  gh.refreshRepoSummary();
                },
                onConnect: gh.connect,
              })}
            </div>
          ) : null}
          <RepoStatusPanel
            status={status}
            branches={gh.branches}
            branchesLoading={gh.branchesLoading}
            summary={gh.repoSummary}
            summaryLoading={gh.repoSummaryLoading}
            onRefreshBranches={gh.refreshBranches}
            onRefreshSummary={gh.refreshRepoSummary}
            onSelectBranch={(repo, branch) => gh.selectRepo(repo, branch)}
            onBack={() => {
              gh.selectRepo(status.selectedRepo!, status.selectedBranch ?? undefined);
            }}
          />
        </div>
      ) : view === "files" ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          {gh.error && !gh.filesLoading && !gh.fileLoading && !gh.searchLoading ? (
            <div className="mb-4">
              {failureBanner("unknown", gh.error, {
                onRetry: gh.refreshFiles,
                onConnect: gh.connect,
              })}
            </div>
          ) : null}
          <div className="mb-4">
            <WriteBranchPanel
              writeBranch={status.writeBranch}
              defaultBranch={status.selectedBranch ?? null}
              loading={gh.writeLoading}
              onCreate={gh.createWriteBranch}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_1.4fr]">
            {/* Left: file tree or search results */}
            <div className="lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
              {searchActive ? (
                <SearchResultsPanel
                  searchResult={gh.searchResult}
                  searchLoading={gh.searchLoading}
                  selectedPath={selectedPath}
                  onSelectFile={(path) => {
                    setSelectedPath(path);
                    gh.readFile(path);
                  }}
                />
              ) : (
                <FileExplorerPanel
                  files={gh.files}
                  filesTruncated={gh.filesTruncated}
                  filesLoading={gh.filesLoading}
                  searchLoading={gh.searchLoading}
                  selectedPath={selectedPath}
                  onRefresh={gh.refreshFiles}
                  onSelectFile={(path) => {
                    setSelectedPath(path);
                    gh.readFile(path);
                  }}
                  onSearch={(query) => {
                    setSearchActive(true);
                    gh.searchCode(query);
                  }}
                  onClearSearch={() => {
                    setSearchActive(false);
                  }}
                />
              )}
            </div>
            {/* Right: file viewer + editor */}
            <div className="flex min-h-[60vh] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:max-h-[calc(100vh-12rem)]">
              <FileViewerPanel
                fileContent={gh.fileContent}
                fileLoading={gh.fileLoading}
                error={gh.error}
                selectedPath={selectedPath}
                writeBranch={status.writeBranch}
                writeLoading={gh.writeLoading}
                onSave={async (path, content, message, sha) => {
                  if (sha) {
                    return gh.updateFile(path, content, message, sha);
                  }
                  return gh.createFile(path, content, message);
                }}
              />
            </div>
          </div>
        </div>
      ) : view === "diff" ? (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          {gh.error && !gh.diffLoading ? (
            <div className="mb-4">
              {failureBanner("unknown", gh.error, {
                onRetry: gh.refreshDiff,
                onConnect: gh.connect,
              })}
            </div>
          ) : null}
          <DiffViewerPanel
            files={gh.diffFiles}
            base={gh.diffBase}
            head={gh.diffHead}
            loading={gh.diffLoading}
            hasWriteBranch={!!status.writeBranch}
            onRefresh={gh.refreshDiff}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          {gh.error && !gh.prLoading ? (
            <div className="mb-4">
              {failureBanner("unknown", gh.error, {
                onRetry: () => {},
                onConnect: gh.connect,
              })}
            </div>
          ) : null}
          <PullRequestPanel
            hasWriteBranch={!!status.writeBranch}
            writeBranch={status.writeBranch}
            defaultBranch={gh.diffBase}
            pullRequest={gh.pullRequest}
            loading={gh.prLoading}
            onCreate={gh.createPullRequest}
          />
        </div>
      )}
    </WorkspaceFrame>
  );
}

/** The persistent frame: topbar + sidebar + scrollable content area. */
function WorkspaceFrame({
  status,
  loading,
  sidebarOpen,
  setSidebarOpen,
  view,
  onViewChange,
  children,
}: {
  status: ReturnType<typeof useGitHub>["status"];
  loading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  view: WorkspaceView;
  onViewChange: (v: WorkspaceView) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <DeveloperTopbar status={status} loading={loading} />
      <div className="flex flex-1 overflow-hidden">
        <DeveloperSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeView={view}
          onViewChange={onViewChange}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile sidebar trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="m-3 inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent lg:hidden"
          >
            <Menu className="size-4" />
            Menu
          </button>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
