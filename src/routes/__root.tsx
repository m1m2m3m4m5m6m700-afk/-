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
  }),
});
