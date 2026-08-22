import { createRoute, Link, useParams } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, RotateCcw, Upload, Zap } from 'lucide-react';
import { runWorkflowPipeline, type PipelineProgress } from '../lib/workflows/pipeline-runner';
import { trackProductEvent } from '../lib/analytics/productEvents';
import { getIntentSEO } from '../config/intents';
import { getWorkflow } from '../lib/workflows/registry';
import { planFromWorkflow, generateExecutionPlan, type ExecutionPlan } from '../lib/ai/planner';
import { rootRoute } from './__root';

export const enQuickFlowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/en/quickflow/$workflowId',
  head: () => ({ meta: [
    { title: 'QuickFlow | FLIXO' },
    { name: 'description', content: 'Run a focused FLIXO image workflow locally in your browser.' },
    { name: 'robots', content: 'noindex,follow' },
  ] }),
  component: function QuickFlowPage() {
    const { workflowId } = useParams({ from: '/en/quickflow/$workflowId' });
    const workflow = getWorkflow(workflowId);
    const [file, setFile] = useState<File | null>(null);
    const [plan, setPlan] = useState<ExecutionPlan | null>(null);
    const [progress, setProgress] = useState<PipelineProgress | null>(null);
    const [result, setResult] = useState<Blob | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiBusy, setAiBusy] = useState(false);
    const [intentSlug, setIntentSlug] = useState('');

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const presetSlug = params.get('preset') || '';
      setIntentSlug(presetSlug);
      const intent = getIntentSEO(presetSlug);
      setPlan(planFromWorkflow(workflowId, intent?.preset ? { ...intent.preset } : {}));
      if (workflow) trackProductEvent('workflow_suggested', { workflowId: workflow.id });
    }, [workflow, workflowId]);

    const resultUrl = useMemo(() => result ? URL.createObjectURL(result) : '', [result]);
    useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

    if (!workflow) {
      return <main className="image-tool-shell"><div className="image-tool-container"><h1>QuickFlow not found</h1><Link className="primary-button" to="/">Back to FLIXO</Link></div></main>;
    }

    const run = async () => {
      if (!file || !plan) { setError('Choose an image first.'); return; }
      setBusy(true); setError(''); setResult(null);
      try {
        const output = await runWorkflowPipeline(file, plan, setProgress);
        setResult(output);
        trackProductEvent('workflow_completed', { workflowId: workflow.id, steps: plan.steps.length });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Workflow failed.');
      } finally { setBusy(false); }
    };

    const generateAiPlan = async () => {
      if (!aiPrompt.trim()) return;
      setAiBusy(true); setError('');
      try {
        const nextPlan = await generateExecutionPlan(aiPrompt.trim());
        setPlan(nextPlan); setIntentSlug('');
        trackProductEvent('workflow_suggested', { workflowId: 'ai-plan', steps: nextPlan.steps.length });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'AI planner failed.');
      } finally { setAiBusy(false); }
    };

    const reset = () => {
      setFile(null); setResult(null); setProgress(null);
      const intent = getIntentSEO(intentSlug);
      setPlan(planFromWorkflow(workflow.id, intent?.preset ? { ...intent.preset } : {}));
      setError(''); trackProductEvent('repeat_workflow', { workflowId: workflow.id });
    };

    const percent = progress ? Math.round((progress.currentStepIndex / progress.totalSteps) * 100) : result ? 100 : 0;
    const currentName = progress ? plan?.steps[progress.currentStepIndex - 1]?.toolId : '';
    const seoIntent = getIntentSEO(intentSlug);

    return (
      <main className="image-tool-shell">
        <div className="image-tool-container quickflow-shell">
          <Link to="/" className="language-link">← FLIXO</Link>
          <p className="image-tool-eyebrow" style={{ marginTop: 28 }}>QUICKFLOW · LOCAL-FIRST PIPELINE</p>
          <h1>{plan?.workflowName || workflow.title}</h1>
          <p className="image-tool-lead">{seoIntent?.outcome || workflow.description}</p>
          <section className="compressor-card quickflow-run-card" aria-label="Run QuickFlow">
            <label className="upload-zone" htmlFor="quickflow-file"><Upload size={24} aria-hidden="true" /><span className="upload-title">{file ? file.name : 'Choose an image to run this flow'}</span><span className="upload-subtitle">The image stays in your browser for the selected local steps.</span></label>
            <input id="quickflow-file" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <div className="quickflow-ai-box"><div><strong>Need a different plan?</strong><span>Ask FLIXO AI for a safe execution chain; the image still stays local after planning.</span></div><div className="quickflow-ai-row"><input value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="e.g. make this ready for an online store" /><button type="button" className="secondary-button" disabled={aiBusy || !aiPrompt.trim()} onClick={generateAiPlan}>{aiBusy ? 'Planning…' : 'Plan with AI'}</button></div></div>
            <div className="quickflow-progress"><span><strong>{percent}%</strong> complete {currentName ? `· ${currentName}` : ''}</span><div><i style={{ width: `${percent}%` }} /></div></div>
            <section className="quickflow-card" aria-label={`${workflow.title} execution steps`}>
              {plan?.steps.map((step, index) => <div key={`${step.toolId}-${index}`} className={`quickflow-step ${progress?.currentToolId === step.toolId ? 'is-next' : ''} ${progress && progress.currentStepIndex > index ? 'is-done' : ''}`}><div className="quickflow-step-number">{progress && progress.currentStepIndex > index ? <CheckCircle2 size={20} /> : <span>{index + 1}</span>}</div><div className="quickflow-step-copy"><strong>{step.toolId}</strong><span>{Object.keys(step.params ?? {}).length ? JSON.stringify(step.params) : 'Recommended step'}</span></div></div>)}
            </section>
            {error && <div className="error-box" role="alert">{error}</div>}
            <div className="quickflow-footer-actions"><button type="button" className="primary-button" disabled={busy || !file || !plan} onClick={run}>{busy ? <><Zap size={16} /> Running…</> : <><Zap size={16} /> Run workflow</>}</button><button type="button" className="secondary-button" disabled={!file && !result} onClick={reset}><RotateCcw size={16} /> Repeat</button></div>
          </section>
          {result && <section className="result-card quickflow-result"><h2>Result ready</h2><p>All enabled local steps completed in your browser.</p><img src={resultUrl} alt="FLIXO QuickFlow result" className="preview-image" /><div className="quickflow-footer-actions"><a className="download-button" href={resultUrl} download={`flixo-${workflow.id}.webp`} onClick={() => trackProductEvent('download_clicked', { workflowId: workflow.id })}><Download size={16} /> Download result</a><Link className="secondary-button" to="/">Back to goals <ArrowRight size={16} /></Link></div></section>}
        </div>
      </main>
    );
  },
});
