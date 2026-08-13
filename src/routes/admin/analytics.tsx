import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminAnalyticsDashboard } from "@/components/admin/analytics/AdminAnalyticsDashboard";
import { AdminGate } from "@/components/admin/AdminGate";

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
      <AdminGate areaLabel="Admin analytics">
        <AdminAnalyticsDashboard />
      </AdminGate>
    </SiteLayout>
  );
}
