import { HeadContent, Outlet, Scripts, createRootRoute, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

export const rootRoute = createRootRoute({
  component: function RootLayout() {
    const location = useLocation();
    useEffect(() => {
      const isArabic = location.pathname === '/ar' || location.pathname.startsWith('/ar/');
      document.documentElement.lang = isArabic ? 'ar' : 'en';
      document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    }, [location.pathname]);

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
