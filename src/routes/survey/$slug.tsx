import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { getPublicSurvey, submitPublicSurvey } from "@/lib/admin/rpc/behavior.rpc";

export const Route = createFileRoute("/survey/$slug")({
  head: () => ({ meta: [{ title: "Flixo Survey" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PublicSurveyRoute,
});

type SurveyPayload = Extract<Awaited<ReturnType<typeof getPublicSurvey>>, { ok: true }>;
type Answer = string | number | boolean | string[] | null;

function sessionId() {
  const key = "flixo-survey-session";
  const existing = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(key) : null;
  if (existing) return existing;
  const value = crypto.randomUUID();
  sessionStorage.setItem(key, value);
  return value;
}

function Question({ question, value, onChange }: { question: SurveyPayload["questions"][number]; value: Answer; onChange: (value: Answer) => void }) {
  const options = question.options ?? [];
  const config = question.config ?? {};
  switch (question.type) {
    case "yes_no": return <div className="grid gap-2 sm:grid-cols-2"><button className={`rounded-xl border p-3 text-sm ${value === true ? "border-primary bg-primary/10" : "border-border"}`} onClick={() => onChange(true)} type="button">{String(config.yesLabel ?? "نعم")}</button><button className={`rounded-xl border p-3 text-sm ${value === false ? "border-primary bg-primary/10" : "border-border"}`} onClick={() => onChange(false)} type="button">{String(config.noLabel ?? "لا")}</button></div>;
    case "single_choice": return <div className="grid gap-2">{options.map((option) => <label key={option} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"><input type="radio" name={question.id} checked={value === option} onChange={() => onChange(option)} />{option}</label>)}</div>;
    case "multi_choice": return <div className="grid gap-2">{options.map((option) => { const current = Array.isArray(value) ? value : []; return <label key={option} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"><input type="checkbox" checked={current.includes(option)} onChange={(e) => onChange(e.target.checked ? [...current, option] : current.filter((x) => x !== option))} />{option}</label>; })}</div>;
    case "dropdown": return <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)}><option value="">اختر…</option>{options.map((option) => <option key={option}>{option}</option>)}</select>;
    case "rating": return <div className="flex gap-2" dir="ltr">{Array.from({ length: Number(config.max ?? 5) }, (_, i) => i + 1).map((n) => <button key={n} type="button" className={`text-2xl ${Number(value) >= n ? "opacity-100" : "opacity-30"}`} onClick={() => onChange(n)} aria-label={`Rating ${n}`}>★</button>)}</div>;
    case "nps": return <div className="grid grid-cols-6 gap-2 sm:grid-cols-11" dir="ltr">{Array.from({ length: 11 }, (_, n) => <button key={n} type="button" onClick={() => onChange(n)} className={`rounded-lg border px-2 py-2 text-sm ${value === n ? "border-primary bg-primary/10" : "border-border"}`}>{n}</button>)}</div>;
    case "scale": return <input className="w-full" type="range" min={Number(config.min ?? 1)} max={Number(config.max ?? 5)} value={Number(value ?? config.min ?? 1)} onChange={(e) => onChange(Number(e.target.value))} />;
    case "number": return <input className="w-full rounded-xl border border-border bg-background px-3 py-2" type="number" value={typeof value === "number" ? value : ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
    case "date": return <input className="w-full rounded-xl border border-border bg-background px-3 py-2" type="date" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />;
    case "email": return <input className="w-full rounded-xl border border-border bg-background px-3 py-2" type="email" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />;
    case "url": return <input className="w-full rounded-xl border border-border bg-background px-3 py-2" type="url" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />;
    case "textarea": return <textarea className="min-h-32 w-full rounded-xl border border-border bg-background p-3" value={typeof value === "string" ? value : ""} maxLength={Number(config.maxLength ?? 4000)} onChange={(e) => onChange(e.target.value)} />;
    case "consent": return <label className="flex items-start gap-2 rounded-xl border border-border p-3 text-sm"><input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} /><span>{String(config.label ?? "أوافق على المشاركة")}</span></label>;
    default: return <input className="w-full rounded-xl border border-border bg-background px-3 py-2" type="text" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

function PublicSurveyRoute() {
  const { slug } = Route.useParams();
  const [payload, setPayload] = useState<SurveyPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { void getPublicSurvey({ data: { slug } }).then((result) => { if (result.ok) setPayload(result); else setError(result.kind === "closed" ? "هذا الاستبيان مغلق." : "الاستبيان غير متاح."); }); }, [slug]);

  const submit = async () => {
    if (!payload) return;
    setError(null);
    const result = await submitPublicSurvey({ data: { surveyId: payload.survey.id, sessionId: sessionId(), locale: typeof navigator !== "undefined" ? navigator.language : undefined, answers } });
    if (result.ok) setSubmitted(true); else setError("تعذر إرسال المشاركة. تحقق من الحقول المطلوبة وحاول مرة أخرى.");
  };

  if (submitted) return <SiteLayout><div className="mx-auto max-w-2xl px-5 py-20 text-center"><h1 className="text-3xl font-black">شكرًا لمساهمتك</h1><p className="mt-3 text-sm text-muted-foreground">تم تسجيل رأيك بنجاح.</p></div></SiteLayout>;
  if (error) return <SiteLayout><div className="mx-auto max-w-2xl px-5 py-20 text-center text-sm text-muted-foreground">{error}</div></SiteLayout>;
  if (!payload) return <SiteLayout><div className="mx-auto max-w-2xl px-5 py-20 text-center text-sm text-muted-foreground">جارٍ تحميل الاستبيان…</div></SiteLayout>;

  return <SiteLayout><main className="mx-auto max-w-2xl space-y-6 px-5 py-12" dir="rtl"><header><h1 className="text-3xl font-black">{payload.survey.title}</h1>{payload.survey.description && <p className="mt-2 text-sm text-muted-foreground">{payload.survey.description}</p>}</header>{payload.questions.map((question) => <section key={question.id} className="rounded-2xl border border-border/70 bg-card/70 p-5"><label className="block text-sm font-bold">{question.prompt}{question.required ? " *" : ""}</label><div className="mt-4"><Question question={question} value={answers[question.id] ?? null} onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} /></div></section>)}{error && <p className="text-sm text-rose-500">{error}</p>}<Button className="w-full rounded-xl" onClick={() => void submit()}>إرسال المشاركة</Button></main></SiteLayout>;
}
