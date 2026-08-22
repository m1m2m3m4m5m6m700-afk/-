import { createRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, Image, LayoutGrid, Search, ShieldCheck, Sparkles, Wand2, Zap } from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/tools';
import { trackProductEvent } from '../lib/analytics/productEvents';
import { resolveIntent } from '../lib/intent/resolver';
import { getWorkflow } from '../lib/workflows/registry';
import { rootRoute } from './__root';

const featuredIds = ['image-compressor', 'background-remover', 'ai-image-generator', 'image-upscaler', 'image-converter', 'pix'];
const categories = ['All', 'Edit', 'Convert', 'Create', 'AI'] as const;
const intentChips = [
  { label: 'Remove background', query: 'remove background' },
  { label: 'Make it smaller', query: 'make it smaller' },
  { label: 'Make it sharper', query: 'make it sharper' },
  { label: 'Product photo', query: 'make this product photo ready for my store' },
] as const;
type Category = (typeof categories)[number];

function getCategory(id: string): Exclude<Category, 'All'> {
  if (id === 'ai-image-generator' || id === 'pix') return 'AI';
  if (['image-converter', 'image-compressor', 'image-to-svg', 'image-ocr', 'exif-cleaner', 'svg-optimizer'].includes(id)) return 'Convert';
  if (['meme-generator', 'collage-maker', 'mockup-generator', 'passport-photo-maker', 'watermark-adder'].includes(id)) return 'Create';
  return 'Edit';
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: () => ({ meta: [
    { title: 'FLIXO | Simple AI & Image Tools' },
    { name: 'description', content: 'Tell FLIXO the result you want. Get the right image tool or a simple workflow that gets you there.' },
    { name: 'robots', content: 'index,follow,max-image-preview:large' },
  ] }),
  component: function HomePage() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<Category>('All');
    const intent = useMemo(() => resolveIntent(query), [query]);
    const workflow = intent.kind === 'workflow' ? getWorkflow(intent.id ?? '') : undefined;
    const readyTools = useMemo(() => TOOLS_REGISTRY.filter((tool) => tool.isReady), []);
    const featuredTools = useMemo(() => featuredIds.map((id) => readyTools.find((tool) => tool.id === id)).filter(Boolean), [readyTools]);
    const visibleTools = useMemo(() => {
      const q = query.trim().toLowerCase();
      return readyTools.filter((tool) => {
        const matchesCategory = category === 'All' || getCategory(tool.id) === category;
        const matchesQuery = !q || `${tool.title} ${tool.description}`.toLowerCase().includes(q) || (intent.kind === 'tool' && intent.id === tool.id);
        return matchesCategory && matchesQuery;
      });
    }, [category, intent.id, intent.kind, query, readyTools]);

    const runIntent = (nextQuery: string) => {
      setQuery(nextQuery);
      setCategory('All');
      trackProductEvent('intent_submitted', { queryLength: nextQuery.length });
      window.setTimeout(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    };

    const suggestedPath = workflow
      ? `/en/quickflow/${workflow.id}`
      : (readyTools.find((tool) => tool.id === intent.id)?.path ?? '/');

    return (
      <main className="home-shell">
        <header className="home-nav-wrap"><div className="home-nav">
          <Link to="/" className="home-brand" aria-label="FLIXO home"><span className="home-brand-mark">F</span><span>FLIXO</span></Link>
          <nav className="home-nav-links" aria-label="Primary navigation"><a href="#tools">Tools</a><Link to="/en/pix">Pix Studio</Link></nav>
          <Link to="/en/image-compressor" className="home-nav-cta">Start creating</Link>
        </div></header>

        <div className="home-container home-modern">
          <section className="home-hero" aria-labelledby="home-title">
            <div className="home-hero-copy">
              <p className="image-tool-eyebrow">FLIXO · AI + IMAGE WORKFLOWS</p>
              <h1 id="home-title">Tell us the result. FLIXO gets you there.</h1>
              <p className="home-lead home-hero-lead">Start with the outcome, not the tool name. FLIXO routes you to one tool or a focused QuickFlow.</p>
              <div className="home-search" role="search">
                <Search size={20} aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') runIntent(query); }} placeholder="What do you want to make? Try “make my product photo ready”" aria-label="Describe your goal" />
                <kbd>/</kbd>
              </div>
              <div className="home-intent-row" aria-label="Popular goals">{intentChips.map((chip) => <button key={chip.query} type="button" onClick={() => runIntent(chip.query)}>{chip.label}</button>)}</div>
              {intent.kind !== 'none' && intent.confidence >= 0.72 && (
                <div className="home-intent-result">
                  <div><span className="home-intent-result-kicker">RECOMMENDED</span><strong>{workflow?.title ?? readyTools.find((tool) => tool.id === intent.id)?.title}</strong><span>{workflow?.description ?? 'A focused tool for this goal.'}</span></div>
                  <span className="home-intent-confidence">{Math.round(intent.confidence * 100)}% match</span>
                  <Link to={suggestedPath} className="primary-button" onClick={() => trackProductEvent('workflow_started', { workflowId: workflow?.id ?? intent.id ?? 'direct-tool' })}>Start <ArrowUpRight size={17} /></Link>
                  {workflow && <div className="home-intent-steps">{workflow.steps.map((step) => <span key={step.toolId}><Check size={13} /> {step.title}</span>)}</div>}
                </div>
              )}
              <div className="home-hero-proof"><span><Zap size={15} /> Fast to start</span><span><ShieldCheck size={15} /> Browser-first</span><span><LayoutGrid size={15} /> {readyTools.length} ready tools</span></div>
            </div>

            <div className="home-hero-card"><div className="home-hero-card-glow" aria-hidden="true" /><div className="home-hero-card-top"><span className="home-card-badge"><Sparkles size={14} /> QuickFlow</span><span className="home-card-muted">No maze</span></div><div className="home-hero-card-content"><div className="home-hero-icon"><Wand2 size={30} /></div><p className="home-hero-card-title">One goal. One clear path.</p><p className="home-hero-card-copy">FLIXO keeps multi-step work behind one simple recommendation so the user stays focused on the result.</p><div className="home-hero-mini-flow"><span><b>1</b> Intent</span><span><b>2</b> Workflow</span><span><b>3</b> Result</span></div><Link to="/en/ai-image-generator" className="primary-button home-hero-button">Explore AI <ArrowUpRight size={17} /></Link></div></div>
          </section>

          <section className="home-workflow" aria-labelledby="workflow-title"><div className="home-section-heading"><div><p className="home-section-kicker">THE FLIXO WAY</p><h2 id="workflow-title">Less interface. More outcome.</h2></div></div><div className="home-workflow-grid"><div><span>01</span><Check size={18} /><strong>Choose the outcome</strong><p>Tell FLIXO what you want in plain language.</p></div><div><span>02</span><Check size={18} /><strong>Follow the focused path</strong><p>One tool or a small QuickFlow, never a giant control panel.</p></div><div><span>03</span><Check size={18} /><strong>Export and repeat</strong><p>Get the result, then repeat the same workflow when needed.</p></div></div></section>

          <section className="home-quick-section" aria-labelledby="quick-title"><div className="home-section-heading"><div><p className="home-section-kicker">START HERE</p><h2 id="quick-title">Popular jobs, one click away</h2></div><span>{featuredTools.length} quick picks</span></div><div className="home-featured-grid">{featuredTools.map((tool, index) => tool ? <Link key={tool.id} to={tool.path} className={`home-featured-card home-featured-card-${index + 1}`}><span className="home-featured-icon"><Image size={20} /></span><span className="home-featured-copy"><strong>{tool.title}</strong><span>{tool.description}</span></span><ArrowUpRight className="home-featured-arrow" size={18} /></Link> : null)}</div></section>

          <section id="tools" className="home-tools-section" aria-labelledby="tools-title"><div className="home-section-heading home-tools-heading"><div><p className="home-section-kicker">THE TOOLBOX</p><h2 id="tools-title">Everything else, still easy to find.</h2><p>Browse the full capability only when you need it.</p></div><span>{visibleTools.length} results</span></div><div className="home-category-row">{categories.map((item) => <button key={item} type="button" className={`home-category ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="home-tool-grid">{visibleTools.map((tool) => <Link key={tool.id} to={tool.path} className="home-tool-card"><span className="home-tool-icon"><Image size={19} /></span><span className="home-tool-body"><strong>{tool.title}</strong><span>{tool.description}</span></span><ArrowUpRight size={17} className="home-tool-arrow" /></Link>)}</div>{visibleTools.length === 0 && <div className="home-empty-tools"><Search size={22} /><strong>No direct match yet.</strong><span>Try “product photo”, “compress”, “remove background”, or “make it sharper”.</span></div>}</section>

          <section className="home-principles"><div><Zap size={18} /><strong>Fast path</strong><span>Start from the result.</span></div><div><Wand2 size={18} /><strong>Useful AI</strong><span>AI routes the hard-to-name jobs.</span></div><div><ShieldCheck size={18} /><strong>Clear output</strong><span>Every path ends in a useful result.</span></div></section>
          <footer className="home-footer"><span>FLIXO · Fast outcome automation for image tasks.</span><Link to="/en/pix">Open Pix Studio <ArrowUpRight size={15} /></Link></footer>
        </div>
      </main>
    );
  },
});
