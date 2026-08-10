import { createFileRoute } from "@tanstack/react-router";
import { DeveloperWorkspace } from "@/components/developer/DeveloperWorkspace";

/**
 * /developer — Flixo Developer Workspace.
 *
 * A standalone, self-contained route (it does NOT use SiteLayout) so the
 * developer experience is independent of the marketing site. Reuses the root
 * ThemeProvider for dark/light mode and the existing GitHub layer
 * (`useGitHub` + Phase 2 RPCs) — no second GitHub client, no OAuth, no Octokit.
 *
 * `noindex` because this is a private workspace, not a public page.
 */
export const Route = createFileRoute("/developer")({
  head: () => ({
    meta: [
      { title: "Developer Workspace — Flixo" },
      {
        name: "description",
        content:
          "Connect a GitHub repository and browse its branches and latest commits from the Flixo developer workspace.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DeveloperRoute,
});

function DeveloperRoute() {
  return <DeveloperWorkspace />;
}
