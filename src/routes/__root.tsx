import { useEffect } from 'react';
import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router';
import { installCoreWebVitalsDiagnostics } from '../lib/diagnostics/performance';

export const rootRoute = createRootRoute({
  component: function RootLayout() {
    useEffect(() => installCoreWebVitalsDiagnostics(), []);

    return (
      <>
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
  }),
});
