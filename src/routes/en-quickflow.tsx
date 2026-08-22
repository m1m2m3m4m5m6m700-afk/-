import { createRoute, Link, useParams } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/tools';
import { trackProductEvent } from '../lib/analytics/productEvents';
import { getWorkflow } from '../lib/workflows/registry';
import { rootRoute } from './__root';

export const enQuickFlowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/en/quickflow/$workflowId',
  head: () => ({
    meta: [
      { title: 'QuickFlow | FLIXO' },
      { name: 'description', content: 'Complete a focused FLIXO workflow one clear step at a time.' },
      { name: 'robots', content: 'noindex,follow' },
    ],
  }),
  component: function QuickFlowPage() {
    const { workflowId } = useParams({ from: '/en/quickflow/$workflowId' });
    const workflow = getWorkflow(workflowId);
    const storageKey = `flixo:workflow:${workflowId}`;
    const [completed, setCompleted] = useState<string[]>([]);

    useEffect(() => {
      try {
        const saved = JSON.parse(window.sessionStorage.getItem(storageKey) ?? '[]');
        if (Array.isArray(saved)) setCompleted(saved.filter((item): item is string => typeof item === 'string'));
      } catch {
        // Progress is optional and never blocks the workflow.
      }
    }, [storageKey]);

    useEffect(() => {
      if (!workflow) return;
      trackProductEvent('workflow_suggested', { workflowId: workflow.id });
    }, [workflow]);

    const nextIndex = useMemo(() => workflow?.steps.findIndex((step) => !completed.includes(step.toolId)) ?? -1, [completed, workflow]);
    const nextStep = nextIndex >= 0 ? workflow?.steps[nextIndex] : undefined;
    const progress = workflow ? Math.round((completed.length / workflow.steps.length) * 100) : 0;

    if (!workflow) {
      return <main className="image-tool-shell"><div className="image-tool-container"><h1>QuickFlow not found</h1><Link className="primary-button" to="/">Back to FLIXO</Link></div></main>;
    }

    const markComplete = (toolId: string) => {
      const next = completed.includes(toolId) ? completed.filter((id) => id !== toolId) : [...completed, toolId];
      setCompleted(next);
      try { window.sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* optional */ }
      if (next.includes(toolId)) trackProductEvent('step_skipped', { workflowId: workflow.id, toolId });
      if (next.length === workflow.steps.length) trackProductEvent('workflow_completed', { workflowId: workflow.id });
    };

    return (
      <main className="image-tool-shell">
        <div className="image-tool-container quickflow-shell">
          <Link to="/" className="language-link">← FLIXO</Link>
          <p className="image-tool-eyebrow" style={{ marginTop: 28 }}>QUICKFLOW</p>
          <h1>{workflow.title}</h1>
          <p className="image-tool-lead">{workflow.description}</p>

          <div className="quickflow-progress"><span><strong>{progress}%</strong> complete</span><div><i style={{ width: `${progress}%` }} /></div></div>

          <section className="quickflow-card" aria-label={`${workflow.title} steps`}>
            {workflow.steps.map((step, index) => {
              const tool = TOOLS_REGISTRY.find((item) => item.id === step.toolId);
              const isDone = completed.includes(step.toolId);
              const isNext = nextStep?.toolId === step.toolId;
              return (
                <div key={step.toolId} className={`quickflow-step ${isNext ? 'is-next' : ''} ${isDone ? 'is-done' : ''}`}>
                  <div className="quickflow-step-number">{isDone ? <CheckCircle2 size={20} /> : <span>{index + 1}</span>}</div>
                  <div className="quickflow-step-copy"><strong>{step.title}</strong><span>{step.optional ? 'Optional' : 'Recommended step'}{tool ? ` · ${tool.title}` : ''}</span></div>
                  <div className="quickflow-step-actions">
                    {tool && <Link to={tool.path} className="secondary-button" onClick={() => trackProductEvent('workflow_started', { workflowId: workflow.id, toolId: step.toolId })}>Open <ArrowRight size={16} /></Link>}
                    <button type="button" className="quickflow-complete" onClick={() => markComplete(step.toolId)} aria-label={`${isDone ? 'Undo' : 'Mark'} ${step.title}`}>
                      {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="quickflow-footer-actions">
            {completed.length > 0 && <button type="button" className="secondary-button" onClick={() => { setCompleted([]); try { window.sessionStorage.removeItem(storageKey); } catch { /* optional */ } trackProductEvent('repeat_workflow', { workflowId: workflow.id }); }}><RotateCcw size={16} /> Start again</button>}
            <Link to="/" className="primary-button">Back to goals <ArrowRight size={16} /></Link>
          </div>
        </div>
      </main>
    );
  },
});
