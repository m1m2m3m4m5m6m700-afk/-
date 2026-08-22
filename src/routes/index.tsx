import { createRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, Image, Lock, Search, ShieldCheck, Sparkles, Wand2, Zap } from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/tools';
import { INTENT_SLUGS_REGISTRY } from '../config/intents';
import { trackProductEvent } from '../lib/analytics/productEvents';
import { resolveIntent } from '../lib/intent/resolver';
import { getWorkflow } from '../lib/workflows/registry';
import { RotateRepeatIcon } from '../components/home/RotateRepeatIcon';
import { rootRoute } from './__root';

const featuredIds = ['image-compressor', 'background-remover', 'ai-image-generator', 'image-upscaler', 'image-converter', 'pix'];
const categories = ['All', 'Edit', 'Convert', 'Create', 'AI'] as const;
const intentChips = [
  { label: '🛒 Product Ready', query: 'make this product photo ready for my store' },
  { label: '📱 Social Ready', query: 'make this image ready for social media' },
  { label: '👤 Profile Ready', query: 'make this image ready for a profile' },
  { label: '⚡ Improve Image', query: 'make this image sharper and better quality' },
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
    { title: 'FLIXO | Fast, Local-First Image Workflows' },
    { name: 'description', content: 'Tell FLIXO the result you want. Use local-first image tools and QuickFlows without learning a giant editor.' },
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
    };

    const suggestedPath = workflow ? `/en/quickflow/${workflow.id}` : (readyTools.find((tool) => tool.id === intent.id)?.path ?? '/');

    return (
      <main className="home-shell">
        <header className="home-nav-wrap"><div className="home-nav">
          <Link to="/" className="home-brand" aria-label="FLIXO home"><span className="home-brand-mark">F</span><span>FLIXO</span></Link>
          <nav className="home-nav-links" aria-label="Primary navigation"><a href="#tools">Tools</a><a href="/en/pix">Pix Studio</a></nav>
          <Link to="/en/image-compressor" className="home-nav-cta">Start creating</Link>
        </div></header>

        <div className="home-container home-modern">
          <section className="home-hero" aria-labelledby="home-title">
            <div className="home-hero-copy">
              <p className="image-tool-eyebrow">FLIXO · LOCAL-FIRST IMAGE WORKFLOWS</p>
              <h1 id="home-title">Turn any image into a ready result — fast.</h1>
              <p className="home-lead home-hero-lead">Tell FLIXO the outcome you need. It routes you to one focused tool or a QuickFlow, with local browser processing whenever the tool supports it.</p>
              <div className="home-search" role="search">
                <Search size={20} aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') runIntent(query); }} placeholder="“Make this product photo ready for my store…”" aria-label="Describe your goal" />
                <kbd>/</kbd>
              </div>
              <div className="home-intent-row" aria-label="Popular goals">{intentChips.map((chip) => <button key={chip.query} type="button" onClick={() => runIntent(chip.query)}>{chip.label}</button>)}</div>
              {intent.kind !== 'none' && intent.confidence >= 0.72 && (
                <div className="home-intent-result">
                  <div><span className="home-intent-result-kicker">RECOMMENDED</span><strong>{workflow?.title ?? readyTools.find((tool) => tool.id === intent.id)?.title}</strong><span>{workflow?.description ?? 'A focused tool for this goal.'}</span></div>
                  <span className="home-intent-confidence">{Math.round(intent.confidence * 100)}% match</span>
                  <a href={suggestedPath} className="primary-button" onClick={() => trackProductEvent('workflow_started', { workflowId: workflow?.id ?? intent.id ?? 'direct-tool' })}>Start <ArrowUpRight size={17} /></a>
                  {workflow && <div className="home-intent-steps">{workflow.steps.map((step) => <span key={step.toolId}><Check size={13} /> {step.title}</span>)}</div>}
                </div>
              )}
              <div className="home-local-note"><Lock size={15} /><span>Local-first: many FLIXO image tools process in your browser. AI/cloud-backed tools clearly say so.</span></div>
            </div>

            <div className="home-hero-card"><div className="home-hero-card-glow" aria-hidden="true" /><div className="home-hero-card-top"><span className="home-card-badge"><Sparkles size={14} /> QuickFlow</span><span className="home-card-muted">No maze</span></div><div className="home-hero-card-content"><div className="home-hero-icon"><Wand2 size={30} /></div><p className="home-hero-card-title">One goal. One clear path.</p><p className="home-hero-card-copy">FLIXO hides the tool chain and keeps the user focused on the finished result.</p><div className="home-hero-mini-flow"><span><b>1</b> Intent</span><span><b>2</b> Plan</span><span><b>3</b> Result</span></div><a href="/en/ai-image-generator" className="primary-button home-hero-button">Explore AI <ArrowUpRight size={17} /></a></div></div>
          </section>

          <section className="home-competitive-proof" aria-label="FLIXO competitive advantages"><div><Zap size={18} /><strong>Fast path</strong><span>Start from the result, not the editor.</span></div><div><Lock size={18} /><strong>Local-first</strong><span>Browser processing where supported.</span></div><div><ShieldCheck size={18} /><strong>No account required</strong><span>Use the tools before creating an account.</span></div><div><RotateRepeatIcon /><strong>Repeat</strong><span>Run the same workflow again with less setup.</span></div></section>
          <section className="home-workflow" aria-labelledby="workflow-title"><div className="home-section-heading"><div><p className="home-section-kicker">THE FLIXO WAY</p><h2 id="workflow-title">Outcome first. Complexity hidden.</h2></div></div><div className="home-workflow-grid"><div><span>01</span><Check size={18} /><strong>Say what you need</strong><p>Use plain language or pick a ready goal.</p></div><div><span>02</span><Check size={18} /><strong>Let FLIXO route it</strong><p>One tool or a short QuickFlow from known capabilities.</p></div><div><span>03</span><Check size={18} /><strong>Get it done, then repeat</strong><p>Download the result and reuse the same path next time.</p></div></div></section>
          <section className="home-quick-section" aria-labelledby="quick-title"><div className="home-section-heading"><div><p className="home-section-kicker">START HERE</p><h2 id="quick-title">Popular jobs, one click away</h2></div><span>{featuredTools.length} quick picks</span></div><div className="home-featured-grid">{featuredTools.map((tool, index) => tool ? <Link key={tool.id} to={tool.path} className={`home-featured-card home-featured-card-${index + 1}`}><span className="home-featured-icon"><Image size={20} /></span><span className="home-featured-copy"><strong>{tool.title}</strong><span>{tool.description}</span></span><ArrowUpRight className="home-featured-arrow" size={18} /></Link> : null)}</div></section>
          <section className="home-quick-section" aria-labelledby="intent-library-title"><div className="home-section-heading"><div><p className="home-section-kicker">OUTCOME LIBRARY</p><h2 id="intent-library-title">Start from the job you actually need.</h2><p>Each path opens with the right workflow already prepared.</p></div><span>{INTENT_SLUGS_REGISTRY.length} use cases</span></div><div className="home-featured-grid">{INTENT_SLUGS_REGISTRY.map((intentItem) => <a key={intentItem.slug} href={`/en/use-case/${intentItem.slug}`} className="home-featured-card"><span className="home-featured-icon"><Zap size={20} /></span><span className="home-featured-copy"><strong>{intentItem.title}</strong><span>{intentItem.outcome}</span></span><ArrowUpRight className="home-featured-arrow" size={18} /></a>)}</div></section>
          <section id="tools" className="home-tools-section" aria-labelledby="tools-title"><div className="home-section-heading home-tools-heading"><div><p className="home-section-kicker">THE TOOLBOX</p><h2 id="tools-title">The full power stays available.</h2><p>Browse only when you want a specific tool. The simple path remains the default.</p></div><span>{visibleTools.length} results</span></div><div className="home-category-row">{categories.map((item) => <button key={item} type="button" className={`home-category ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="home-tool-grid">{visibleTools.map((tool) => <Link key={tool.id} to={tool.path} className="home-tool-card"><span className="home-tool-icon"><Image size={19} /></span><span className="home-tool-body"><strong>{tool.title}</strong><span>{tool.description}</span></span><ArrowUpRight size={17} className="home-tool-arrow" /></Link>)}</div>{visibleTools.length === 0 && <div className="home-empty-tools"><Search size={22} /><strong>No direct match yet.</strong><span>Try “product photo”, “compress”, “remove background”, or “make it sharper”.</span></div>}</section>
          <section className="home-principles"><div><Zap size={18} /><strong>Speed without the maze</strong><span>Short paths beat giant editors.</span></div><div><Lock size={18} /><strong>Privacy by default</strong><span>Local-first processing where supported.</span></div><div><Wand2 size={18} /><strong>Useful AI</strong><span>AI plans the path; known tools do the work.</span></div></section>
          <footer className="home-footer"><span>FLIXO · Fast outcome automation for image tasks.</span><a href="/en/pix">Open Pix Studio <ArrowUpRight size={15} /></a></footer>
        </div>
      </main>
    );
  },
});
