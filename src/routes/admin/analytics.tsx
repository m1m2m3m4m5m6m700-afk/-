import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminAnalyticsDashboard } from "@/components/admin/analytics/AdminAnalyticsDashboard";

const ADMIN_ENABLED = import.meta.env.DEV;

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Owner Admin Analytics Dashboard — Flixo" },
      {
        name: "description",
        content: "Flixo Owner Admin Production Analytics & Visitor Intelligence Dashboard.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAnalyticsRoute,
});

function AdminAnalyticsRoute() {
  return (
    <SiteLayout>
      {ADMIN_ENABLED ? (
        <AdminAnalyticsDashboard />
      ) : (
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-5 py-20 text-center lg:px-8">
          <div className="space-y-3 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground">Admin analytics unavailable</h1>
            <p className="text-sm text-muted-foreground">
              This route is disabled outside local development builds.
            </p>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
