import { createRoute, Link } from '@tanstack/react-router';
import { rootRoute } from './__root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: () => ({
    meta: [
      { title: 'FLIXO | Image Tools Online' },
      { name: 'description', content: 'Fast browser-based image tools from FLIXO. Start with Image Compressor and explore simple, privacy-friendly image processing.' },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
    ],
  }),
  component: function HomePage() {
    return (
      <main className="home-shell">
        <div className="home-container">
          <p className="image-tool-eyebrow">FLIXO · IMAGE TOOLS</p>
          <h1>Image tools built for real search intent</h1>
          <p className="home-lead">Compress, resize, convert, and improve images with fast browser-first tools and clear results.</p>
          <Link className="primary-button home-cta" to="/en/image-compressor">Open Image Compressor</Link>
        </div>
      </main>
    );
  },
});
