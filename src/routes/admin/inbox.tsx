import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminInbox } from "@/components/communication/AdminInbox";
import { AdminGate } from "@/components/admin/AdminGate";

export const Route = createFileRoute("/admin/inbox")({
  head: () => ({
    meta: [
      { title: "Owner Admin Inbox — Flixo" },
      {
        name: "description",
        content: "Flixo Owner Communication Inbox and Management Dashboard.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminInboxRoute,
});

function AdminInboxRoute() {
  return (
    <SiteLayout>
      <AdminGate areaLabel="Owner inbox">
        <AdminInbox />
      </AdminGate>
    </SiteLayout>
  );
}
