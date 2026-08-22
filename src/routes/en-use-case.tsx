import { createRoute, Link, useParams } from '@tanstack/react-router';
import { ArrowRight, Check, Lock, Sparkles, Zap } from 'lucide-react';
import { getIntentSEO } from '../config/intents';
import { getWorkflow } from '../lib/workflows/registry';
import { rootRoute } from './__root';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://flixo.app').replace(/\/$/, '');

export const enUseCaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/en/use-case/$slug',
  head: ({ params }) => {
    const intent = getIntentSEO(params.slug);
    if (!intent) return { meta: [{ title: 'Use Case | FLIXO' }, { name: 'robots', content: 'noindex' }] };
    const canonical = `${SITE_URL}/en/use-case/${intent.slug}`;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `FLIXO — ${intent.title}`,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      url: canonical,
      description: intent.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };
    return {
      meta: [
        { title: `${intent.title} | FLIXO` },
        { name: 'description', content: intent.description },
        { name: 'keywords', content: intent.keywords.join(', ') },
        { property: 'og:title', content: intent.title },
        { property: 'og:description', content: intent.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonical },
      ],
      links: [{ rel: 'canonical', href: canonical }],
      scripts: [{ type: 'application/ld+json', children: JSON.stringify(schema) }],
    };
  },
  component: function UseCasePage() {
    const { slug } = useParams({ from: '/en/use-case/$slug' });
    const intent = getIntentSEO(slug);
    if (!intent) return <main className="image-tool-shell"><div className="image-tool-container"><h1>Use case not found</h1><Link className="primary-button" to="/">Back to FLIXO</Link></div></main>;

    const workflow = getWorkflow(intent.workflowId);
    const preset = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').toString();
    const quickFlowUrl = `/en/quickflow/${intent.workflowId}?preset=${encodeURIComponent(intent.slug)}${preset ? `&${preset}` : ''}`;

    return (
      <main className="image-tool-shell">
        <div className="image-tool-container">
          <Link to="/" className="language-link">← FLIXO</Link>
          <section style={{ maxWidth: 860, paddingTop: 48 }}>
            <p className="image-tool-eyebrow">FLIXO · OUTCOME WORKFLOW</p>
            <h1>{intent.title}</h1>
            <p className="image-tool-lead">{intent.description}</p>
            <div className="quickflow-ai-box" style={{ marginTop: 24 }}>
              <div><strong>{intent.outcome}</strong><span>Start with one upload. FLIXO keeps the workflow focused and uses local processing wherever the selected tools support it.</span></div>
              <Link to={quickFlowUrl} className="primary-button">Start this workflow <ArrowRight size={17} /></Link>
            </div>

            <div className="home-workflow-grid" style={{ marginTop: 24 }}>
              {(workflow?.steps ?? []).map((step, index) => (
                <div key={step.toolId}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <Check size={18} />
                  <strong>{step.title}</strong>
                  <p>{step.optional ? 'Optional when needed.' : 'Recommended step in this outcome.'}</p>
                </div>
              ))}
            </div>

            <div className="home-principles" style={{ marginTop: 28 }}>
              <div><Zap size={18} /><strong>Outcome-first</strong><span>You start from the result, not a tool list.</span></div>
              <div><Lock size={18} /><strong>Local-first</strong><span>Supported image steps can run in your browser.</span></div>
              <div><Sparkles size={18} /><strong>Repeatable</strong><span>Use the same QuickFlow again without rebuilding it.</span></div>
            </div>
          </section>
        </div>
      </main>
    );
  },
});
