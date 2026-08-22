import { createRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Image, LayoutGrid, Search, ShieldCheck, Sparkles, Wand2, Zap } from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/tools';
import { rootRoute } from './__root';

const featuredIds = ['image-compressor', 'background-remover', 'ai-image-generator', 'image-upscaler', 'image-converter', 'pix'];
const categories = ['All', 'Edit', 'Convert', 'Create', 'AI'] as const;
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
      const normalizedQuery = query.trim().toLowerCase();
      return readyTools.filter((tool) => {
        const matchesCategory = category === 'All' || getCategory(tool.id) === category;
        const matchesQuery = !normalizedQuery || `${tool.title} ${tool.description}`.toLowerCase().includes(normalizedQuery);
        return matchesCategory && matchesQuery;
      });
    }, [category, query, readyTools]);

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
              <h1 id="home-title">Do more with your images. Without the maze.</h1>
              <p className="home-lead home-hero-lead">
                Edit, convert, create, and enhance with one clear tool for each job — plus AI where it actually helps.
              </p>
              <div className="home-search" role="search">
                <Search size={20} aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What do you want to do? Try “remove background”"
                  aria-label="Search tools"
                />
                <kbd>/</kbd>
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
                <span className="home-card-badge"><Sparkles size={14} /> AI ready</span>
                <span className="home-card-muted">One simple workspace</span>
              </div>
              <div className="home-hero-card-content">
                <div className="home-hero-icon"><Wand2 size={30} /></div>
                <p className="home-hero-card-title">Start from the result you want.</p>
                <p className="home-hero-card-copy">No giant control panel. Pick the job, make the change, download the result.</p>
                <Link to="/en/ai-image-generator" className="primary-button home-hero-button">
                  Try AI tools <ArrowUpRight size={17} />
                </Link>
              </div>
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
                  <span className="home-featured-copy">
                    <strong>{tool.title}</strong>
                    <span>{tool.description}</span>
                  </span>
                  <ArrowUpRight className="home-featured-arrow" size={18} />
                </Link>
              ) : null)}
            </div>
          </section>

          <section id="tools" className="home-tools-section" aria-labelledby="tools-title">
            <div className="home-section-heading home-tools-heading">
              <div>
                <p className="home-section-kicker">THE TOOLBOX</p>
                <h2 id="tools-title">Find the right tool, fast.</h2>
                <p>Grouped by the outcome you want — not by how complicated the technology is.</p>
              </div>
              <span>{visibleTools.length} results</span>
            </div>

            <div className="home-category-row" aria-label="Tool categories">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`home-category ${category === item ? 'is-active' : ''}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="home-tool-grid">
              {visibleTools.map((tool) => (
                <Link key={tool.id} to={tool.path} className="home-tool-card">
                  <span className="home-tool-icon"><Image size={19} /></span>
                  <span className="home-tool-body">
                    <strong>{tool.title}</strong>
                    <span>{tool.description}</span>
                  </span>
                  <ArrowUpRight size={17} className="home-tool-arrow" />
                </Link>
              ))}
            </div>

            {visibleTools.length === 0 && (
              <div className="home-empty-tools">
                <Search size={22} />
                <strong>No tool matched that search.</strong>
                <span>Try a simpler phrase like “compress”, “remove”, or “convert”.</span>
              </div>
            )}
          </section>

          <section className="home-principles" aria-label="Why FLIXO">
            <div><Zap size={18} /><strong>Fast path</strong><span>Get from idea to tool in one step.</span></div>
            <div><Wand2 size={18} /><strong>Useful AI</strong><span>AI appears where it adds a real shortcut.</span></div>
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
