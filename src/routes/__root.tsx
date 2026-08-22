import { HeadContent, Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { directionForLocale, localeFromPath, type SupportedLocale } from '../seo/site';

function NotFoundPage() {
  return (
    <main className="seo-not-found" data-testid="not-found-page">
      <span className="image-tool-eyebrow">FLIXO</span>
      <h1>Page not found</h1>
      <p>The page or tool you requested does not exist or is not currently available.</p>
      <meta name="robots" content="noindex,follow" />
      <Link to="/">Return to FLIXO</Link>
    </main>
  );
}

export const rootRoute = createRootRoute({
  component: function RootLayout() {
    useEffect(() => {
      const locale: SupportedLocale = localeFromPath(window.location.pathname);
      document.documentElement.lang = locale;
      document.documentElement.dir = directionForLocale(locale);
    }, []);

    useEffect(() => {
      const handleNavigation = () => {
        const locale = localeFromPath(window.location.pathname);
        document.documentElement.lang = locale;
        document.documentElement.dir = directionForLocale(locale);
      };
      window.addEventListener('popstate', handleNavigation);
      window.addEventListener('hashchange', handleNavigation);
      return () => {
        window.removeEventListener('popstate', handleNavigation);
        window.removeEventListener('hashchange', handleNavigation);
      };
    }, []);

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
