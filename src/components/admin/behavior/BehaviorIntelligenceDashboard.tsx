import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Eye,
  FlaskConical,
  Globe2,
  MousePointer2,
  Route,
  Search,
  ShieldCheck,
  Timer,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createAdminSurvey,
  getAdminBehaviorOverview,
  getAdminSurveys,
  setAdminSurveyActive,
} from "@/lib/admin/rpc/behavior.rpc";

type Overview = Extract<Awaited<ReturnType<typeof getAdminBehaviorOverview>>, { ok: true }>;

type Survey = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  active: boolean;
  targetLocale: string | null;
  maxResponses: number | null;
};

function formatDuration(ms: number): string {
  if (!ms) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; count: number }>;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data in this period.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-surface/30 px-3 py-2.5"
            >
              <span className="min-w-0 truncate text-xs text-foreground">{item.key}</span>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {item.count}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function BehaviorIntelligenceDashboard() {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSurvey, setNewSurvey] = useState({
    slug: "",
    title: "",
    description: "",
    targetLocale: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [behavior, surveyResult] = await Promise.all([
        getAdminBehaviorOverview({ data: { days } }),
        getAdminSurveys(),
      ]);
      if (!behavior.ok) {
        throw new Error(
          behavior.kind === "not_configured" ? "Database is not configured." : "Not authenticated.",
        );
      }
      if (!surveyResult.ok) {
        throw new Error(
          surveyResult.kind === "not_configured" ? "Database is not configured." : "Not authenticated.",
        );
      }
      setOverview(behavior);
      setSurveys(surveyResult.surveys as Survey[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load behavior intelligence.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const createSurvey = async () => {
    if (!newSurvey.slug || !newSurvey.title) return;
    const result = await createAdminSurvey({
      data: {
        slug: newSurvey.slug,
        title: newSurvey.title,
        description: newSurvey.description || undefined,
        targetLocale: newSurvey.targetLocale || undefined,
      },
    });
    if (result.ok) {
      setNewSurvey({ slug: "", title: "", description: "", targetLocale: "" });
      await load();
    }
  };

  const toggleSurvey = async (survey: Survey) => {
    const result = await setAdminSurveyActive({
      data: { id: survey.id, active: !survey.active },
    });
    if (result.ok) await load();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">
        Loading privacy-first behavior intelligence…
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-destructive">
        {error ?? "Could not load behavior intelligence."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Owner</Badge>
            <span className="text-xs text-muted-foreground">First-party analytics</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Privacy-first Behavior Intelligence
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No Google tracker or raw user content is required for this dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((value) => (
            <Button
              key={value}
              size="sm"
              variant={days === value ? "default" : "outline"}
              onClick={() => setDays(value)}
              className="rounded-xl text-xs"
            >
              {value}d
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => void load()} className="rounded-xl">
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Eye} label="Sessions" value={overview.sessions} />
        <MetricCard icon={MousePointer2} label="Pageviews" value={overview.pageViews} />
        <MetricCard icon={Wrench} label="Tools started" value={overview.toolStarts} />
        <MetricCard icon={Timer} label="Avg journey duration" value={formatDuration(overview.averageJourneyMs)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Breakdown title="Top tools" items={overview.topTools} />
        <Breakdown title="Top search intents" items={overview.topIntents} />
        <Breakdown title="Top locales" items={overview.locales} />
        <Breakdown title="Top path transitions" items={overview.pathTransitions} />
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-4 text-primary" />
          <h2 className="text-sm font-bold">Survey control center</h2>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <input
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            placeholder="slug"
            value={newSurvey.slug}
            onChange={(e) => setNewSurvey((s) => ({ ...s, slug: e.target.value }))}
          />
          <input
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            placeholder="title"
            value={newSurvey.title}
            onChange={(e) => setNewSurvey((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            placeholder="target locale (optional)"
            value={newSurvey.targetLocale}
            onChange={(e) => setNewSurvey((s) => ({ ...s, targetLocale: e.target.value }))}
          />
          <Button
            className="rounded-xl"
            onClick={() => void createSurvey()}
            disabled={!newSurvey.slug || !newSurvey.title}
          >
            Create survey
          </Button>
          <input
            className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm md:col-span-4"
            placeholder="description (optional)"
            value={newSurvey.description}
            onChange={(e) => setNewSurvey((s) => ({ ...s, description: e.target.value }))}
          />
        </div>

        <div className="mt-4 space-y-2">
          {surveys.length === 0 ? (
            <p className="text-xs text-muted-foreground">No surveys configured.</p>
          ) : (
            surveys.map((survey) => (
              <div
                key={survey.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{survey.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    /{survey.slug}
                    {survey.targetLocale ? ` • ${survey.targetLocale}` : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={survey.active ? "default" : "outline"}
                  onClick={() => void toggleSurvey(survey)}
                  className="rounded-xl text-xs"
                >
                  {survey.active ? "Active" : "Draft"}
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Route} label="Path transitions" value={overview.pathTransitions.length} />
        <MetricCard icon={Search} label="Searches" value={overview.searches} />
        <MetricCard icon={ShieldCheck} label="Event types tracked" value={overview.eventMix.length} />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
