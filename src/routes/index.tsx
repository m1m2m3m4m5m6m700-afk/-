import { createRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, Image, LayoutGrid, Search, ShieldCheck, Sparkles, Wand2, Zap } from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/tools';
import { rootRoute } from './__root';

const featuredIds = ['image-compressor', 'background-remover', 'ai-image-generator', 'image-upscaler', 'image-converter', 'pix'];
const categories = ['All', 'Edit', 'Convert', 'Create', 'AI'] as const;
const intentChips = [
  { label: 'Remove background', query: 'remove background' },
  { label: 'Make it smaller', query: 'compress' },
  { label: 'Make it sharper', query: 'upscale' },
  { label: 'Create with AI', query: 'ai image' },
] as const;
type Category = (typeof categories)[number];

const intentAliases: Record<string, string[]> = {
  'remove background': ['background remover', 'background'],
  compress: ['compressor', 'smaller', 'reduce file size', 'optimize'],
  upscale: ['upscaler', 'sharper', 'enhance', 'quality'],
  'ai image': ['ai image generator', 'generate image', 'create image', 'ai'],
  crop: ['cropper', 'resize', 'dimensions'],
  convert: ['converter', 'format', 'webp', 'png', 'jpg', 'svg'],
  text: ['ocr', 'image to text', 'extract text'],
};

function getCategory(id: string): Exclude<Category, 'All'> {
  if (id === 'ai-image-generator' || id === 'pix') return 'AI';
  if (['image-converter', 'image-compressor', 'image-to-svg', 'image-ocr', 'exif-cleaner', 'svg-optimizer'].includes(id)) return 'Convert';
  if (['meme-generator', 'collage-maker', 'mockup-generator', 'passport-photo-maker', 'watermark-adder'].includes(id)) return 'Create';
  return 'Edit';
}

function searchScore(title: string, description: string, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 0;
  const haystack = `${title} ${description}`.toLowerCase();
  if (haystack.includes(normalized)) return 100;
  const aliases = intentAliases[normalized] ?? [];
  const aliasHits = aliases.reduce((score, alias) => score + (haystack.includes(alias) ? 25 : 0), 0);
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordHits = words.reduce((score, word) => score + (haystack.includes(word) ? 8 : 0), 0);
  return aliasHits + wordHits;
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: () => ({
    meta: [
      { title: 'FLIXO | Simple AI & Image Tools' },
      { name: 'description', content: 'A focused suite of AI and browser-first image tools for editing, converting, creating, and enhancing images.' },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
    ],
  }),
  component: function HomePage() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<Category>('All');

    const readyTools = useMemo(() => TOOLS_REGISTRY.filter((tool) => tool.isReady), []);
    const featuredTools = useMemo(
      () => featuredIds.map((id) => readyTools.find((tool) => tool.id === id)).filter(Boolean),
      [readyTools],
    );
    const visibleTools = useMemo(() => {
      const matches = readyTools
        .map((tool) => ({ tool, score: searchScore(tool.title, tool.description, query) }))
        .filter(({ tool, score }) => category === 'All' ? (!query.trim() || score > 0) : getCategory(tool.id) === category && (!query.trim() || score > 0))
        .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title));
      return matches.map(({ tool }) => tool);
    }, [category, query, readyTools]);

    const runIntent = (nextQuery: string) => {
      setQuery(nextQuery);
      setCategory('All');
      window.setTimeout(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    };

    return (
      <main className="home-shell">
        <header className="home-nav-wrap">
          <div className="home-nav">
            <Link to="/" className="home-brand" aria-label="FLIXO home">
              <span className="home-brand-mark">F</span>
              <span>FLIXO</span>
            </Link>
            <nav className="home-nav-links" aria-label="Primary navigation">
              <a href="#tools">Tools</a>
              <Link to="/en/pix">Pix Studio</Link>
            </nav>
            <Link to="/en/image-compressor" className="home-nav-cta">Start creating</Link>
          </div>
        </header>

        <div className="home-container home-modern">
          <section className="home-hero" aria-labelledby="home-title">
            <div className="home-hero-copy">
              <p className="image-tool-eyebrow">FLIXO · AI + IMAGE TOOLS</p>
              <h1 id="home-title">Tell us the result. FLIXO gets you there.</h1>
              <p className="home-lead home-hero-lead">Edit, convert, create, and enhance from one focused starting point — with AI when it removes a step.</p>

              <div className="home-search" role="search">
                <Search size={20} aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What do you want to do? Try “remove background”"
                  aria-label="Search tools by goal"
                />
                <kbd>/</kbd>
              </div>

              <div className="home-intent-row" aria-label="Popular goals">
                {intentChips.map((chip) => (
                  <button key={chip.query} type="button" onClick={() => runIntent(chip.query)}>{chip.label}</button>
                ))}
              </div>

              <div className="home-hero-proof" aria-label="FLIXO product highlights">
                <span><Zap size={15} /> Fast to start</span>
                <span><ShieldCheck size={15} /> Browser-first workflows</span>
                <span><LayoutGrid size={15} /> {readyTools.length} ready tools</span>
              </div>
            </div>

            <div className="home-hero-card">
              <div className="home-hero-card-glow" aria-hidden="true" />
              <div className="home-hero-card-top">
                <span className="home-card-badge"><Sparkles size={14} /> Smart start</span>
                <span className="home-card-muted">One clear workflow</span>
              </div>
              <div className="home-hero-card-content">
                <div className="home-hero-icon"><Wand2 size={30} /></div>
                <p className="home-hero-card-title">From idea to finished image.</p>
                <p className="home-hero-card-copy">Choose the result you want. FLIXO keeps the controls behind the task instead of putting the whole toolbox in your face.</p>
                <div className="home-hero-mini-flow" aria-label="FLIXO workflow">
                  <span><b>1</b> Choose</span><span><b>2</b> Create</span><span><b>3</b> Export</span>
                </div>
                <Link to="/en/ai-image-generator" className="primary-button home-hero-button">Try AI tools <ArrowUpRight size={17} /></Link>
              </div>
            </div>
          </section>

          <section className="home-workflow" aria-labelledby="workflow-title">
            <div className="home-section-heading">
              <div>
                <p className="home-section-kicker">THE FLIXO WAY</p>
                <h2 id="workflow-title">One simple loop.</h2>
              </div>
            </div>
            <div className="home-workflow-grid">
              <div><span>01</span><Check size={18} /><strong>Choose the outcome</strong><p>Start with what you want, not the tool name.</p></div>
              <div><span>02</span><Check size={18} /><strong>Use the focused tool</strong><p>Only the controls needed for that job stay in the way.</p></div>
              <div><span>03</span><Check size={18} /><strong>Get the result</strong><p>Preview, download, and move on to the next job.</p></div>
            </div>
          </section>

          <section className="home-quick-section" aria-labelledby="quick-title">
            <div className="home-section-heading">
              <div>
                <p className="home-section-kicker">START HERE</p>
                <h2 id="quick-title">Popular jobs, one click away</h2>
              </div>
              <span>{featuredTools.length} quick picks</span>
            </div>
            <div className="home-featured-grid">
              {featuredTools.map((tool, index) => tool ? (
                <Link key={tool.id} to={tool.path} className={`home-featured-card home-featured-card-${index + 1}`}>
                  <span className="home-featured-icon"><Image size={20} /></span>
                  <span className="home-featured-copy"><strong>{tool.title}</strong><span>{tool.description}</span></span>
                  <ArrowUpRight className="home-featured-arrow" size={18} />
                </Link>
              ) : null)}
            </div>
          </section>

          <section id="tools" className="home-tools-section" aria-labelledby="tools-title">
            <div className="home-section-heading home-tools-heading">
              <div>
                <p className="home-section-kicker">THE TOOLBOX</p>
                <h2 id="tools-title">Everything else, still easy to find.</h2>
                <p>Search by outcome or browse the small set of categories. The full capability stays available without taking over the homepage.</p>
              </div>
              <span>{visibleTools.length} results</span>
            </div>

            <div className="home-category-row" aria-label="Tool categories">
              {categories.map((item) => (
                <button key={item} type="button" className={`home-category ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>

            <div className="home-tool-grid">
              {visibleTools.map((tool) => (
                <Link key={tool.id} to={tool.path} className="home-tool-card">
                  <span className="home-tool-icon"><Image size={19} /></span>
                  <span className="home-tool-body"><strong>{tool.title}</strong><span>{tool.description}</span></span>
                  <ArrowUpRight size={17} className="home-tool-arrow" />
                </Link>
              ))}
            </div>

            {visibleTools.length === 0 && (
              <div className="home-empty-tools">
                <Search size={22} />
                <strong>No tool matched that goal yet.</strong>
                <span>Try “compress”, “remove”, “upscale”, or “create with AI”.</span>
              </div>
            )}
          </section>

          <section className="home-principles" aria-label="Why FLIXO">
            <div><Zap size={18} /><strong>Fast path</strong><span>Get from idea to tool in one step.</span></div>
            <div><Wand2 size={18} /><strong>Useful AI</strong><span>AI appears where it creates a real shortcut.</span></div>
            <div><ShieldCheck size={18} /><strong>Clear output</strong><span>Each tool stays focused on one result.</span></div>
          </section>

          <footer className="home-footer">
            <span>FLIXO · Tools that stay out of your way.</span>
            <Link to="/en/pix">Open Pix Studio <ArrowUpRight size={15} /></Link>
          </footer>
        </div>
      </main>
    );
  },
});
