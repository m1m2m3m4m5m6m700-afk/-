import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminGate } from "@/components/admin/AdminGate";
import { ToolReviewCenter } from "@/components/admin/ToolReviewCenter";

export const Route = createFileRoute("/admin/tools-review")({
  head: () => ({
    meta: [
      { title: "مراجعة أدوات Flixo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminToolReviewRoute,
});

function AdminToolReviewRoute() {
  return (
    <SiteLayout>
      <AdminGate areaLabel="مركز مراجعة الأدوات">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <ToolReviewCenter />
        </div>
      </AdminGate>
    </SiteLayout>
  );
}
