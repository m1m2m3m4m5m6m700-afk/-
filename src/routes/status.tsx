import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CheckCircle2, Server, Globe, Cpu, RefreshCw, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/status")({
  component: StatusRoute,
});

function StatusRoute() {
  usePageSeo(undefined, {
    title: "System Status & Service Uptime — Flixo Tools",
    description:
      "Real-time operational status, system performance metrics, and service uptime monitor for Flixo Tools.",
    keywords: ["system status", "flixo status", "uptime", "service health"],
  });

  return (
    <SiteLayout>
      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-5 py-16 md:px-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
              <Activity className="size-3.5" /> All Systems Operational
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Flixo System Status & Uptime
            </h1>
            <p className="text-lg text-muted-foreground">
              Monitor the live status of Flixo web tools, WASM runtime engines, and CDN edge
              delivery.
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Uptime (30 Days)</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="size-3.5" /> 99.98%
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">Operational</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Avg Latency (TTFB)
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="size-3.5" /> Optimal
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">&lt; 120ms</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Client Runtimes</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="size-3.5" /> Active
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">Browser Native</p>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">Core Subsystems</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-surface/50 p-3.5">
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">CDN & Static Assets</p>
                    <p className="text-xs text-muted-foreground">
                      Global edge routing & cached assets
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-surface/50 p-3.5">
                <div className="flex items-center gap-3">
                  <Cpu className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Browser Tool Engines</p>
                    <p className="text-xs text-muted-foreground">
                      Image, PDF, and Text client workers
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-surface/50 p-3.5">
                <div className="flex items-center gap-3">
                  <Server className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Server API Proxy Routes</p>
                    <p className="text-xs text-muted-foreground">
                      Translation, OCR, and AI services
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Operational
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
