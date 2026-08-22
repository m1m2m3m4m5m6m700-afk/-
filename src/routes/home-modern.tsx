import { Link, createRoute } from '@tanstack/react-router';
import { TOOLS_REGISTRY } from '../config/tools';
import { HomeToolCatalog } from '../components/home-tool-catalog';
import { rootRoute } from './__root';
import { toolHead } from '../seo/head';
import '../home-modern.css';

export const homeModernRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: () => toolHead({ title:'FLIXO | Free Online Image Tools', description:'Fast browser-based image tools for compression, conversion, OCR, resizing, background removal, and creative editing.', pathname:'/', language:'en', applicationCategory:'MultimediaApplication' }),
  component: function ModernHomePage() {
    const readyCount = TOOLS_REGISTRY.filter((tool) => tool.isReady).length;
    return <main className="home-shell"><div className="home-container">
      <nav className="home-nav" aria-label="Primary"><Link to="/" className="brand-mark"><span className="brand-dot" />FLIXO</Link><div className="home-nav-meta"><span>{readyCount} free tools</span><Link to="/en/image-compressor" className="nav-tool-link">Start with Compressor →</Link></div></nav>
      <section className="home-hero"><div className="hero-copy"><p className="image-tool-eyebrow">SMART IMAGE WORKSPACE</p><h1>Everything you need for your images, <span>in one clean place.</span></h1><p className="home-lead">Compress, edit, convert, extract and create — fast, simple, and browser-first.</p><div className="hero-actions"><Link to="/en/image-compressor" className="primary-button">Compress an image</Link><a href="#tools" className="secondary-button">Explore all tools</a></div></div><div className="hero-panel"><div className="hero-panel-grid"><span>LOCAL</span><span>FAST</span><span>PRIVATE</span></div><div className="hero-stats"><div><strong>{readyCount}</strong><span>ready tools</span></div><div><strong>20</strong><span>languages</span></div></div><p>Pick a tool, add your image, and get a clear result without a crowded dashboard.</p></div></section>
      <HomeToolCatalog />
      <footer className="home-footer"><span>FLIXO</span><span>Browser-first image tools · Simple by design.</span></footer>
    </div></main>;
  },
});
