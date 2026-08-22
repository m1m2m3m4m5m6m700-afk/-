import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { ToolErrorBoundary } from '@/components/shared/ToolErrorBoundary';

export const rootRoute = createRootRoute({
  component: function RootLayout() {
    return (
      <>
        <HeadContent />
        <ToolErrorBoundary label="route-tree">
          <Outlet />
        </ToolErrorBoundary>
        <Scripts />
      </>
    );
  },
  notFoundComponent: function RootNotFound() {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center' }}>
        <div>
          <h1>Page not found</h1>
          <p>The requested FLIXO page does not exist.</p>
        </div>
      </main>
    );
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  }),
});
