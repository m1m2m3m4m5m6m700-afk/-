import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminGate } from "@/components/admin/AdminGate";
import { SurveyBuilder } from "@/components/admin/SurveyBuilder";

export const Route = createFileRoute("/admin/surveys")({
  head: () => ({ meta: [{ title: "استبيانات Flixo" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminSurveysRoute,
});

function AdminSurveysRoute() {
  return (
    <SiteLayout>
      <AdminGate areaLabel="منشئ استبيانات Flixo">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <SurveyBuilder />
        </div>
      </AdminGate>
    </SiteLayout>
  );
}
