import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { ToolErrorBoundary } from '@/components/shared/ToolErrorBoundary';

export const Route = createRootRoute({
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
  errorComponent: function RootError({ error, reset }) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center' }}>
        <div>
          <h1>Something went wrong</h1>
          <p>The page hit an unexpected error. You can retry without losing the current route.</p>
          <button type="button" onClick={reset}>Try again</button>
          {import.meta.env.DEV && <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{message}</pre>}
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

// Compatibility alias for legacy route modules; the generated tree uses Route as the contract.
export const rootRoute = Route;
