import { createRoute, Link, useParams } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, RotateCcw, Upload, Zap } from 'lucide-react';
import { getIntentSEO } from '../config/intents';
import { planFromWorkflow, generateExecutionPlan, type ExecutionPlan } from '../lib/ai/planner';
import { runWorkflowPipeline, type PipelineProgress } from '../lib/workflows/pipeline-runner';
import { trackProductEvent } from '../lib/analytics/productEvents';
import { getWorkflow } from '../lib/workflows/registry';
import { rootRoute } from './__root';

export const arQuickFlowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ar/quickflow/$workflowId',
  head: ({ params }) => {
    const workflow = getWorkflow(params.workflowId);
    return {
      meta: [
        { title: `${workflow?.title ?? 'مسار سريع'} | FLIXO` },
        { name: 'description', content: workflow?.description ?? 'مسار سريع لمعالجة الصورة داخل المتصفح.' },
        { name: 'robots', content: 'noindex,follow' },
      ],
      links: [
        { rel: 'canonical', href: `https://flixo.app/ar/quickflow/${params.workflowId}` },
        { rel: 'alternate', hrefLang: 'en', href: `https://flixo.app/en/quickflow/${params.workflowId}` },
        { rel: 'alternate', hrefLang: 'ar', href: `https://flixo.app/ar/quickflow/${params.workflowId}` },
      ],
    };
  },
  component: function ArabicQuickFlowPage() {
    const { workflowId } = useParams({ from: '/ar/quickflow/$workflowId' });
    const workflow = getWorkflow(workflowId);
    const [file, setFile] = useState<File | null>(null);
    const [plan, setPlan] = useState<ExecutionPlan | null>(null);
    const [progress, setProgress] = useState<PipelineProgress | null>(null);
    const [result, setResult] = useState<Blob | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiBusy, setAiBusy] = useState(false);
    const [presetSlug, setPresetSlug] = useState('');
    const resultUrl = useMemo(() => result ? URL.createObjectURL(result) : '', [result]);
    useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

    useEffect(() => {
      const preset = new URLSearchParams(window.location.search).get('preset') ?? '';
      setPresetSlug(preset);
      const intent = getIntentSEO(preset);
      setPlan(planFromWorkflow(workflowId, intent?.preset ? { ...intent.preset } : {}));
    }, [workflowId]);

    if (!workflow) return <main dir="rtl" className="image-tool-shell"><div className="image-tool-container"><h1>المسار غير موجود</h1><Link className="primary-button" to="/ar">العودة إلى FLIXO</Link></div></main>;

    const run = async () => {
      if (!file || !plan) return setError('اختر صورة أولًا.');
      setBusy(true); setError(''); setResult(null);
      try {
        setResult(await runWorkflowPipeline(file, plan, setProgress));
        trackProductEvent('workflow_completed', { workflowId: workflow.id, steps: plan.steps.length });
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تنفيذ المسار.'); }
      finally { setBusy(false); }
    };

    const planWithAi = async () => {
      if (!aiPrompt.trim()) return;
      setAiBusy(true); setError('');
      try { setPlan(await generateExecutionPlan(aiPrompt.trim())); setPresetSlug(''); }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر إعداد الخطة بالذكاء الاصطناعي.'); }
      finally { setAiBusy(false); }
    };

    const repeat = () => {
      const intent = getIntentSEO(presetSlug);
      setFile(null); setResult(null); setProgress(null); setError('');
      setPlan(planFromWorkflow(workflow.id, intent?.preset ? { ...intent.preset } : {}));
      trackProductEvent('repeat_workflow', { workflowId: workflow.id });
    };

    const percent = progress ? Math.round((progress.currentStepIndex / progress.totalSteps) * 100) : result ? 100 : 0;
    const currentTool = progress ? plan?.steps[progress.currentStepIndex - 1]?.toolId : '';

    return (
      <main dir="rtl" className="image-tool-shell">
        <div className="image-tool-container quickflow-shell">
          <Link to="/ar" className="language-link">← FLIXO</Link>
          <p className="image-tool-eyebrow" style={{ marginTop: 28 }}>QUICKFLOW · معالجة محلية أولًا</p>
          <h1>{plan?.workflowName || workflow.title}</h1>
          <p className="image-tool-lead">{workflow.description}</p>
          <section className="compressor-card quickflow-run-card" aria-label="تنفيذ المسار">
            <label className="upload-zone" htmlFor="ar-quickflow-file"><Upload size={24} /><span className="upload-title">{file ? file.name : 'اختر صورة للبدء'}</span><span className="upload-subtitle">تبقى الصورة داخل المتصفح للخطوات المحلية المدعومة.</span></label>
            <input id="ar-quickflow-file" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <div className="quickflow-ai-box"><div><strong>هل تريد مسارًا مختلفًا؟</strong><span>اطلب من FLIXO AI بناء خطة آمنة؛ تنفيذ الصورة يبقى محليًا بعد التخطيط.</span></div><div className="quickflow-ai-row"><input value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="مثال: جهّز الصورة للمتجر" /><button type="button" className="secondary-button" disabled={aiBusy || !aiPrompt.trim()} onClick={() => void planWithAi()}>{aiBusy ? 'جارٍ التخطيط…' : 'خطط بالذكاء الاصطناعي'}</button></div></div>
            <div className="quickflow-progress"><span><strong>{percent}%</strong> مكتمل {currentTool ? `· ${currentTool}` : ''}</span><div><i style={{ width: `${percent}%` }} /></div></div>
            <section className="quickflow-card" aria-label="خطوات المسار">
              {plan?.steps.map((step, index) => <div key={`${step.toolId}-${index}`} className={`quickflow-step ${progress?.currentToolId === step.toolId ? 'is-next' : ''} ${progress && progress.currentStepIndex > index ? 'is-done' : ''}`}><div className="quickflow-step-number">{progress && progress.currentStepIndex > index ? <CheckCircle2 size={20} /> : <span>{index + 1}</span>}</div><div className="quickflow-step-copy"><strong>{step.toolId}</strong><span>{Object.keys(step.params ?? {}).length ? JSON.stringify(step.params) : 'خطوة موصى بها'}</span></div></div>)}
            </section>
            {error && <div className="error-box" role="alert">{error}</div>}
            <div className="quickflow-footer-actions"><button type="button" className="primary-button" disabled={busy || !file || !plan} onClick={() => void run()}>{busy ? <><Zap size={16} /> جارٍ التنفيذ…</> : <><Zap size={16} /> نفّذ المسار</>}</button><button type="button" className="secondary-button" disabled={!file && !result} onClick={repeat}><RotateCcw size={16} /> أعد العملية</button></div>
          </section>
          {result && <section className="result-card quickflow-result"><h2>النتيجة جاهزة</h2><p>اكتملت الخطوات المحلية داخل المتصفح.</p><img src={resultUrl} alt="نتيجة FLIXO" className="preview-image" /><div className="quickflow-footer-actions"><a className="download-button" href={resultUrl} download={`flixo-${workflow.id}.webp`}><Download size={16} /> تنزيل النتيجة</a><Link className="secondary-button" to="/ar">العودة للأهداف <ArrowRight size={16} /></Link></div></section>}
        </div>
      </main>
    );
  },
});
