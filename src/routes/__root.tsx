import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: function RootLayout() {
    return (
      <>
        <a className="brand-mark" href="/" aria-label="FLIXO AI Tools home">
          <img src="/flixo-mark.png" alt="FLIXO" width="36" height="36" />
        </a>
        <HeadContent />
        <Outlet />
      </>
    );
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/flixo-mark.png' },
      { rel: 'apple-touch-icon', href: '/flixo-mark.png' },
    ],
  }),
});
