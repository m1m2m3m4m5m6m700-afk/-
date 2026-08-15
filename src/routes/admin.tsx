import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BrainCircuit, Inbox, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminGate } from "@/components/admin/AdminGate";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Admin — Flixo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminHubRoute,
});

function AdminHubRoute() {
  return (
    <SiteLayout>
      <AdminGate areaLabel="Owner admin">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Flixo Owner Admin</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Private control center for real site activity, tools, messages, and surveys.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link to="/admin/analytics" className="rounded-2xl border border-border/70 bg-surface/30 p-5 transition hover:border-primary/40 hover:bg-primary/5">
                <BarChart3 className="size-5 text-primary" />
                <h2 className="mt-4 font-bold">Analytics</h2>
                <p className="mt-1 text-xs text-muted-foreground">Page views, searches, tools, devices, sources, and recent events.</p>
              </Link>
              <Link to="/admin/behavior" className="rounded-2xl border border-border/70 bg-surface/30 p-5 transition hover:border-primary/40 hover:bg-primary/5">
                <BrainCircuit className="size-5 text-primary" />
                <h2 className="mt-4 font-bold">Behavior & Surveys</h2>
                <p className="mt-1 text-xs text-muted-foreground">Journeys, clicks, search intent, locales, funnels, and survey control.</p>
              </Link>
              <Link to="/admin/inbox" className="rounded-2xl border border-border/70 bg-surface/30 p-5 transition hover:border-primary/40 hover:bg-primary/5">
                <Inbox className="size-5 text-primary" />
                <h2 className="mt-4 font-bold">Owner Inbox</h2>
                <p className="mt-1 text-xs text-muted-foreground">Visitor conversations, requests, and owner replies.</p>
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-muted-foreground">
              Privacy mode: analytics is first-party by default. Search text is hashed client-side, and the collector does not persist raw IP, user-agent, full referrer URLs, or raw search queries.
            </div>
          </div>
        </div>
      </AdminGate>
    </SiteLayout>
  );
}
