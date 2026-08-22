import { HeadContent, Link, Outlet, createRootRoute, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { directionForLocale, localeFromPath, type SupportedLocale } from '../seo/site';

function NotFoundPage() {
  useEffect(() => {
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex,follow';
    return () => robots?.remove();
  }, []);

  return (
    <main className="seo-not-found" data-testid="not-found-page">
      <span className="image-tool-eyebrow">FLIXO</span>
      <h1>Page not found</h1>
      <p>The page or tool you requested does not exist or is not currently available.</p>
      <Link to="/">Return to FLIXO</Link>
    </main>
  );
}

export const rootRoute = createRootRoute({
  component: function RootLayout() {
    const pathname = useLocation({ select: (location) => location.pathname });

    useEffect(() => {
      const locale: SupportedLocale = localeFromPath(pathname);
      document.documentElement.lang = locale;
      document.documentElement.dir = directionForLocale(locale);
    }, [pathname]);

    return (
      <>
        <HeadContent />
        <Outlet />
      </>
    );
  },
  notFoundComponent: NotFoundPage,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
    ],
  }),
});
