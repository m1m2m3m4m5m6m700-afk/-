import { createRoute, Link } from '@tanstack/react-router';
import { TOOLS_REGISTRY } from '../config/tools';
import { rootRoute } from './__root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: () => ({
    meta: [
      { title: 'FLIXO | Image Tools Online' },
      { name: 'description', content: 'Fast browser-based image tools from FLIXO: background removal, compression, conversion, OCR, resizing, upscaling, and more.' },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
    ],
  }),
  component: function HomePage() {
    return (
      <main className="home-shell">
        <div className="home-container">
          <p className="image-tool-eyebrow">FLIXO · IMAGE TOOLS</p>
          <h1>Image tools built for real search intent</h1>
          <p className="home-lead">Fast browser-first image tools with clear results and separate pages for each job.</p>
          <div className="compressor-grid">
            {TOOLS_REGISTRY.map((tool) => <Link key={tool.id} className="compressor-card" to={tool.path}>{tool.title}<span>{tool.description}</span></Link>)}
          </div>
        </div>
      </main>
    );
  },
});
