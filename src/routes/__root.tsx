import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: function RootLayout() {
    return (
      <>
        <HeadContent />
        <Outlet />
        <Scripts />
      </>
    );
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    scripts: [{
      children: `(() => { const path = window.location.pathname; const ar = path === '/ar' || path.startsWith('/ar/'); document.documentElement.lang = ar ? 'ar' : 'en'; document.documentElement.dir = ar ? 'rtl' : 'ltr'; })();`,
    }],
  }),
});
