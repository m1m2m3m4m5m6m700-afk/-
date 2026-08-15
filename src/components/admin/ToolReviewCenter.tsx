import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Search, ShieldCheck, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { tools } from "@/data/tools";
import { competitiveToolRoadmapFlat } from "@/data/competitiveToolRoadmap";
import { getAdminToolReviews, setAdminToolReviewed } from "@/lib/admin/rpc/tool-review.rpc";

type ReviewMap = Record<string, boolean>;
type FilterStatus = "all" | "ready" | "planned" | "not_reviewed" | "reviewed";

type ReviewItem = {
  slug: string;
  name: string;
  category: string;
  status: "ready" | "planned" | "placeholder" | "roadmap";
  purpose: string;
};

const TOOL_STATUSES = new Set(["ready", "planned", "placeholder"]);

function buildReviewItems(): ReviewItem[] {
  const items = new Map<string, ReviewItem>();

  for (const tool of tools) {
    if (!tool.slug) continue;
    items.set(tool.slug, {
      slug: tool.slug,
      name: tool.name,
      category: tool.categoryId,
      status: tool.status,
      purpose: tool.description,
    });
  }

  for (const candidate of competitiveToolRoadmapFlat) {
    if (items.has(candidate.slug)) continue;
    items.set(candidate.slug, {
      slug: candidate.slug,
      name: candidate.name,
      category: candidate.category,
      status: "roadmap",
      purpose: candidate.purpose,
    });
  }

  return [...items.values()].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

export function ToolReviewCenter() {
  const items = useMemo(buildReviewItems, []);
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    setError(null);
    const result = await getAdminToolReviews();
    if (!result.ok) {
      setError(result.kind === "not_configured" ? "قاعدة البيانات غير مهيأة بعد." : "تعذر تحميل حالة مراجعة الأدوات.");
      return;
    }
    const next: ReviewMap = {};
    for (const row of result.reviews) next[row.slug] = row.reviewed;
    setReviews(next);
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const reviewedCount = items.filter((item) => reviews[item.slug]).length;
  const readyCount = items.filter((item) => item.status === "ready").length;
  const reviewedReadyCount = items.filter((item) => item.status === "ready" && reviews[item.slug]).length;

  const visible = items.filter((item) => {
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || `${item.name} ${item.slug} ${item.category} ${item.purpose}`.toLowerCase().includes(needle);
    const reviewed = Boolean(reviews[item.slug]);

    if (!matchesQuery) return false;
    if (status === "reviewed") return reviewed;
    if (status === "not_reviewed") return !reviewed;
    if (status === "ready") return item.status === "ready";
    if (status === "planned") return item.status === "planned" || item.status === "roadmap";
    return true;
  });

  const toggleReview = async (slug: string) => {
    if (busySlug) return;
    const nextValue = !reviews[slug];
    setBusySlug(slug);
    setError(null);
    setReviews((current) => ({ ...current, [slug]: nextValue }));

    const result = await setAdminToolReviewed({ data: { slug, reviewed: nextValue } });
    if (!result.ok) {
      setReviews((current) => ({ ...current, [slug]: !nextValue }));
      setError(result.kind === "not_configured" ? "قاعدة البيانات غير مهيأة بعد." : "تعذر حفظ حالة المراجعة.");
    }
    setBusySlug(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="size-3.5" /> تدقيق الأدوات
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">مركز مراجعة أدوات Flixo</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              النجمة الممتلئة تعني أن المالك راجع الأداة فعليًا. النجمة الفارغة تعني أنها لم تُراجع بعد، حتى لو كانت الأداة تعمل تقنيًا.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-center"><div className="text-xl font-black">{items.length}</div><div className="text-[11px] text-muted-foreground">إجمالي القدرات</div></div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-center"><div className="text-xl font-black">{reviewedCount}</div><div className="text-[11px] text-muted-foreground">تمت مراجعتها</div></div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-center"><div className="text-xl font-black">{readyCount ? `${reviewedReadyCount}/${readyCount}` : "0/0"}</div><div className="text-[11px] text-muted-foreground">جاهزة ومراجعة</div></div>
          </div>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-xs text-rose-500">{error}</div>}

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن أداة أو فئة…"
              className="h-11 w-full rounded-2xl border border-border bg-background px-10 text-sm outline-none focus:border-primary/40"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as FilterStatus)}
            className="h-11 rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
          >
            <option value="all">كل الأدوات</option>
            <option value="not_reviewed">غير مراجعة</option>
            <option value="reviewed">مراجعة</option>
            <option value="ready">جاهزة فقط</option>
            <option value="planned">مخططة / قادمة</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-sm">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_130px_150px] items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 text-[11px] font-bold text-muted-foreground sm:px-5">
          <span>مراجعة</span><span>الأداة</span><span>الحالة</span><span>الفئة</span>
        </div>
        <div className="divide-y divide-border/50">
          {visible.map((item) => {
            const reviewed = Boolean(reviews[item.slug]);
            const isBusy = busySlug === item.slug;
            const canOpen = item.status === "ready" && TOOL_STATUSES.has(item.status);

            return (
              <div key={item.slug} className="grid grid-cols-[auto_minmax(0,1fr)_130px_150px] items-center gap-3 px-4 py-3 hover:bg-primary/[.02] sm:px-5">
                <button
                  type="button"
                  aria-label={reviewed ? `إلغاء مراجعة ${item.name}` : `تأكيد مراجعة ${item.name}`}
                  title={reviewed ? "تمت المراجعة — اضغط لإلغاء العلامة" : "غير مراجعة — اضغط بعد الاختبار الفعلي"}
                  disabled={isBusy}
                  onClick={() => void toggleReview(item.slug)}
                  className={`grid size-10 place-items-center rounded-xl border transition ${reviewed ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
                >
                  <Star className={`size-5 ${reviewed ? "fill-current" : ""}`} />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold">{item.name}</span>
                    {canOpen && (
                      <Link to="/tools/$slug" params={{ slug: item.slug }} className="text-primary hover:text-primary/80" title="فتح الأداة">
                        <ExternalLink className="size-3.5" />
                      </Link>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{item.purpose}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{item.slug}</p>
                </div>
                <span className={`justify-self-start rounded-full px-2.5 py-1 text-[10px] font-bold ${item.status === "ready" ? "bg-emerald-500/10 text-emerald-600" : item.status === "planned" ? "bg-amber-500/10 text-amber-600" : item.status === "roadmap" ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"}`}>
                  {item.status === "ready" ? "جاهزة" : item.status === "planned" ? "مخططة" : item.status === "roadmap" ? "تغطية مستقبلية" : "مسودة"}
                </span>
                <span className="truncate text-xs text-muted-foreground">{item.category}</span>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="px-5 py-14 text-center text-sm text-muted-foreground">لا توجد أدوات مطابقة لهذا البحث.</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-muted/15 px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>قاعدة الجودة: <strong>النجمة لا تعني أن الأداة تعمل.</strong> تعني فقط أنك اختبرتها يدويًا وراجعت الناتج الفعلي. لذلك تبدأ كل الأدوات بدون نجمة.</span></div>
      </div>
    </div>
  );
}
