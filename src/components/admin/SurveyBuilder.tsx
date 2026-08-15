import { useState } from "react";
import { Plus, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminSurvey, createAdminSurveyQuestion } from "@/lib/admin/rpc/behavior.rpc";

const QUESTION_TYPES = [
  ["single_choice", "اختيار واحد"], ["multi_choice", "اختيارات متعددة"], ["dropdown", "قائمة منسدلة"],
  ["scale", "مقياس"], ["rating", "تقييم بالنجوم"], ["nps", "NPS من 0 إلى 10"], ["yes_no", "نعم / لا"],
  ["text", "إجابة نصية قصيرة"], ["textarea", "نص طويل"], ["number", "رقم"], ["date", "تاريخ"],
  ["email", "بريد إلكتروني"], ["url", "رابط"], ["ranking", "ترتيب العناصر"], ["matrix_single", "مصفوفة اختيار واحد"],
  ["matrix_multi", "مصفوفة اختيارات متعددة"], ["consent", "موافقة / إقرار"],
] as const;

type QuestionType = (typeof QUESTION_TYPES)[number][0];

const DEFAULT_CONFIG: Record<QuestionType, Record<string, unknown>> = {
  single_choice: {}, multi_choice: {}, dropdown: {}, scale: { min: 1, max: 5, minLabel: "الأقل", maxLabel: "الأعلى" },
  rating: { max: 5, icon: "star" }, nps: { min: 0, max: 10, detractorMax: 6, promoterMin: 9 }, yes_no: { yesLabel: "نعم", noLabel: "لا" },
  text: { maxLength: 300 }, textarea: { maxLength: 4000 }, number: { min: null, max: null, step: 1 }, date: { min: null, max: null },
  email: {}, url: {}, ranking: {}, matrix_single: { rows: ["البند 1", "البند 2"], columns: ["منخفض", "متوسط", "مرتفع"] },
  matrix_multi: { rows: ["البند 1", "البند 2"], columns: ["ميزة A", "ميزة B", "ميزة C"] }, consent: { label: "أوافق على المشاركة" },
};

export function SurveyBuilder() {
  const [survey, setSurvey] = useState({ slug: "", title: "", description: "", targetLocale: "", maxResponses: "" });
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [type, setType] = useState<QuestionType>("single_choice");
  const [prompt, setPrompt] = useState("");
  const [optionsText, setOptionsText] = useState("ممتاز\nجيد\nمتوسط\nضعيف");
  const [configText, setConfigText] = useState(JSON.stringify(DEFAULT_CONFIG.single_choice, null, 2));
  const [required, setRequired] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const chooseType = (next: QuestionType) => {
    setType(next);
    setConfigText(JSON.stringify(DEFAULT_CONFIG[next], null, 2));
  };

  const create = async () => {
    setMessage(null);
    if (!survey.slug || !survey.title) return setMessage("أدخل slug والعنوان.");
    const result = await createAdminSurvey({ data: { slug: survey.slug, title: survey.title, description: survey.description || undefined, targetLocale: survey.targetLocale || undefined, maxResponses: survey.maxResponses ? Number(survey.maxResponses) : undefined } });
    if (result.ok) { setSurveyId(result.survey.id); setMessage(`تم إنشاء الاستبيان: ${result.survey.title}`); }
    else setMessage("تعذر إنشاء الاستبيان.");
  };

  const addQuestion = async () => {
    setMessage(null);
    if (!surveyId || !prompt.trim()) return setMessage("أنشئ الاستبيان أولًا وأدخل نص السؤال.");
    let config: Record<string, unknown>;
    try { config = JSON.parse(configText) as Record<string, unknown>; } catch { return setMessage("إعدادات السؤال JSON غير صالحة."); }
    const options = optionsText.split("\n").map((item) => item.trim()).filter(Boolean);
    const result = await createAdminSurveyQuestion({ data: { surveyId, type, prompt, options, config, required, sortOrder: Date.now() % 500 } });
    setMessage(result.ok ? "تمت إضافة السؤال." : ("message" in result ? result.message : "تعذر إضافة السؤال."));
    if (result.ok) setPrompt("");
  };

  return (
    <section className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm" dir="rtl">
      <div className="flex items-center gap-2"><Settings2 className="size-5 text-primary" /><h2 className="text-lg font-black">منشئ الاستبيانات المتقدم</h2></div>
      <p className="mt-1 text-xs text-muted-foreground">يدعم كل أنواع الأسئلة العملية، مع إعدادات خاصة للمقياس وNPS والمصفوفات والترتيب.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="slug" value={survey.slug} onChange={(e) => setSurvey((s) => ({ ...s, slug: e.target.value }))} />
        <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="عنوان الاستبيان" value={survey.title} onChange={(e) => setSurvey((s) => ({ ...s, title: e.target.value }))} />
        <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="اللغة (اختياري)" value={survey.targetLocale} onChange={(e) => setSurvey((s) => ({ ...s, targetLocale: e.target.value }))} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="الوصف" value={survey.description} onChange={(e) => setSurvey((s) => ({ ...s, description: e.target.value }))} />
        <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" inputMode="numeric" placeholder="الحد الأقصى للردود" value={survey.maxResponses} onChange={(e) => setSurvey((s) => ({ ...s, maxResponses: e.target.value.replace(/[^0-9]/g, "") }))} />
      </div>
      <Button className="mt-3 rounded-xl" onClick={() => void create()}><Save className="me-2 size-4" />حفظ الاستبيان</Button>

      {surveyId && <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs font-bold text-primary">الاستبيان الحالي: {surveyId}</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <select value={type} onChange={(e) => chooseType(e.target.value as QuestionType)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
            {QUESTION_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm lg:col-span-2" placeholder="نص السؤال" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <textarea className="mt-3 min-h-24 w-full rounded-xl border border-border bg-background p-3 font-mono text-xs" value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="خيار في كل سطر" />
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <textarea className="min-h-40 rounded-xl border border-border bg-background p-3 font-mono text-xs" value={configText} onChange={(e) => setConfigText(e.target.value)} aria-label="Question configuration JSON" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> مطلوب</label>
        </div>
        <Button className="mt-3 rounded-xl" onClick={() => void addQuestion()}><Plus className="me-2 size-4" />إضافة السؤال</Button>
      </div>}
      {message && <p className="mt-4 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">{message}</p>}
    </section>
  );
}
