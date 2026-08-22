import { createRoute, Link } from '@tanstack/react-router';
import { TOOLS_REGISTRY } from '../config/tools';
import { rootRoute } from './__root';
import { toolHead } from '../seo/head';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: () => toolHead({
    title: 'FLIXO | Free Online Image Tools',
    description: 'Fast browser-based image tools for compression, conversion, OCR, resizing, background removal, and creative editing.',
    pathname: '/',
    language: 'en',
    applicationCategory: 'MultimediaApplication',
  }),
  component: function HomePage() {
    const readyTools = TOOLS_REGISTRY.filter((tool) => tool.isReady);
    return (
      <main className="home-shell">
        <div className="home-container">
          <p className="image-tool-eyebrow">FLIXO · IMAGE TOOLS</p>
          <h1>Free browser-based image tools</h1>
          <p className="home-lead">Useful image results, with local browser processing where supported so source files stay on your device.</p>
          <section aria-labelledby="tool-list-heading">
            <h2 id="tool-list-heading" className="sr-only">Available image tools</h2>
            <div className="compressor-grid">
              {readyTools.map((tool) => <Link key={tool.id} className="compressor-card" to={tool.path}>{tool.title}<span>{tool.description}</span></Link>)}
            </div>
          </section>
        </div>
      </main>
    );
  },
});
