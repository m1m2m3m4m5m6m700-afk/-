import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Eye,
  FlaskConical,
  Globe2,
  MousePointer2,
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
  getAdminSurveyResults,
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
type SurveyResults = Extract<Awaited<ReturnType<typeof getAdminSurveyResults>>, { ok: true }>;

function formatDuration(ms: number): string {
  if (!ms) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function Breakdown({ title, items }: { title: string; items: Array<{ key: string; count: number }> }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data in this period.</p>
        ) : (
          items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-surface/30 px-3 py-2.5">
              <span className="min-w-0 truncate text-xs text-foreground">{item.key}</span>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{item.count}</span>
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
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [surveyResults, setSurveyResults] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSurvey, setNewSurvey] = useState({ slug: "", title: "", description: "", targetLocale: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [behavior, surveyResult] = await Promise.all([
        getAdminBehaviorOverview({ data: { days } }),
        getAdminSurveys(),
      ]);
      if (!behavior.ok) throw new Error(behavior.kind === "not_configured" ? "Database is not configured." : "Not authenticated.");
      if (!surveyResult.ok) throw new Error(surveyResult.kind === "not_configured" ? "Database is not configured." : "Not authenticated.");
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

  const loadSurveyResults = async (surveyId: string) => {
    setSelectedSurveyId(surveyId);
    const result = await getAdminSurveyResults({ data: { surveyId } });
    if (result.ok) setSurveyResults(result);
  };

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
    const result = await setAdminSurveyActive({ data: { id: survey.id, active: !survey.active } });
    if (result.ok) await load();
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">Loading privacy-first behavior intelligence…</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-rose-500">{error}</div>;
  }

  if (!overview) return null;

  const cards = [
    ["Sessions", overview.sessions, Globe2],
    ["Page views", overview.pageViews, Eye],
    ["Searches", overview.searches, Search],
    ["Clicks", overview.clickEvents, MousePointer2],
    ["Tool starts", overview.toolStarts, Wrench],
    ["Avg journey step", formatDuration(overview.averageJourneyMs), Timer],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h1 className="text-2xl font-black tracking-tight">Privacy-first Behavior Intelligence</h1>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">First-party only</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Real movement, search intent, clicks, journeys, tools and surveys. No stored IP, raw query, full referrer, or user-agent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((value) => (
            <Button key={value} size="sm" variant={days === value ? "default" : "outline"} onClick={() => setDays(value)} className="rounded-xl text-xs">
              {value}d
            </Button>
          ))}
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void load()}>Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span><Icon className="size-4 text-primary" /></div>
            <div className="mt-3 text-2xl font-black text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Breakdown title="Most used tools" items={overview.topTools} />
        <Breakdown title="Search intent signals" items={overview.topIntents} />
        <Breakdown title="Most visited pages" items={overview.topPages} />
        <Breakdown title="Navigation movement" items={overview.pathTransitions} />
        <Breakdown title="Locales" items={overview.locales} />
        <Breakdown title="Event mix" items={overview.eventMix} />
      </div>

      <section className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <div className="flex items-center gap-2"><FlaskConical className="size-4 text-primary" /><h2 className="text-sm font-bold">Survey control center</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="slug" value={newSurvey.slug} onChange={(e) => setNewSurvey((s) => ({ ...s, slug: e.target.value }))} />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="title" value={newSurvey.title} onChange={(e) => setNewSurvey((s) => ({ ...s, title: e.target.value }))} />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="target locale (optional)" value={newSurvey.targetLocale} onChange={(e) => setNewSurvey((s) => ({ ...s, targetLocale: e.target.value }))} />
          <Button className="rounded-xl" onClick={() => void createSurvey()} disabled={!newSurvey.slug || !newSurvey.title}>Create survey</Button>
        </div>
        <input className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="description (optional)" value={newSurvey.description} onChange={(e) => setNewSurvey((s) => ({ ...s, description: e.target.value }))} />

        <div className="mt-5 space-y-2">
          {surveys.length === 0 ? (
            <p className="text-xs text-muted-foreground">No surveys created yet.</p>
          ) : surveys.map((survey) => (
            <div key={survey.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-3">
              <div><p className="text-sm font-semibold">{survey.title}</p><p className="text-[11px] text-muted-foreground">/{survey.slug}{survey.targetLocale ? ` • ${survey.targetLocale}` : ""}</p></div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => void loadSurveyResults(survey.id)} className="rounded-xl text-xs">Results</Button>
                <Button size="sm" variant={survey.active ? "default" : "outline"} onClick={() => void toggleSurvey(survey)} className="rounded-xl text-xs">{survey.active ? "Active" : "Draft"}</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {surveyResults && selectedSurveyId && (
        <section className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Survey results · {surveyResults.survey.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{surveyResults.responses.toLocaleString()} anonymous responses</p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">No respondent identity</Badge>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {surveyResults.questions.map((question) => (
              <div key={question.questionId} className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs font-semibold text-foreground">{question.prompt}</p>
                <div className="mt-3 space-y-2">
                  {question.choices.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">No responses yet.</p>
                  ) : question.choices.slice(0, 10).map((choice) => (
                    <div key={choice.key} className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate">{choice.key}</span>
                      <span className="font-semibold text-primary">{choice.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-border/70 bg-surface/30 px-4 py-3 text-xs text-muted-foreground">
        Journey data uses a session-scoped random identifier stored only in sessionStorage. It is not a cross-site identity, and raw search text never reaches the analytics database.
      </div>
    </div>
  );
}
