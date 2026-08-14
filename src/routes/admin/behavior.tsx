import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminGate } from "@/components/admin/AdminGate";
import { BehaviorIntelligenceDashboard } from "@/components/admin/behavior/BehaviorIntelligenceDashboard";

export const Route = createFileRoute("/admin/behavior")({
  head: () => ({
    meta: [
      { title: "Owner Admin Behavior Intelligence — Flixo" },
      {
        name: "description",
        content: "Privacy-first first-party behavior, search-intent, journey, and survey intelligence.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BehaviorRoute,
});

function BehaviorRoute() {
  return (
    <SiteLayout>
      <AdminGate areaLabel="Behavior intelligence">
        <BehaviorIntelligenceDashboard />
      </AdminGate>
    </SiteLayout>
  );
}
