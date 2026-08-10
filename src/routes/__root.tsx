import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, type ReactNode } from "react";
import { localeMeta, type LocaleCode } from "../lib/i18n";

import appCss from "../styles.css?url";
import { JsonLd } from "../components/seo/JsonLd";
import {
  buildOrganizationSchema,
  buildRootWebApplicationSchema,
  buildWebSiteSchema,
} from "@/lib/seo/structuredData";
import { reportClientError } from "../lib/client-error-reporting";
import { ThemeProvider } from "../lib/theme";
import { I18nProvider } from "../lib/i18n";
import { AnalyticsProvider } from "../lib/analytics";

type RootJsonLd =
  | ReturnType<typeof buildRootWebApplicationSchema>
  | ReturnType<typeof buildOrganizationSchema>
  | ReturnType<typeof buildWebSiteSchema>;

let _jsonLdData: RootJsonLd[] | null = null;
function getJsonLdData() {
  if (!_jsonLdData) {
    _jsonLdData = [
      buildRootWebApplicationSchema(),
      buildOrganizationSchema(),
      buildWebSiteSchema(),
    ];
  }
  return _jsonLdData;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Flixo — One workspace for every AI tool" },
      {
        name: "description",
        content:
          "Flixo brings translation, writing, vision and audio AI tools into one fast, private workspace.",
      },
      { name: "author", content: "Flixo" },
      { name: "theme-color", content: "#0d9488" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { property: "og:title", content: "Flixo — One workspace for every AI tool" },
      {
        property: "og:description",
        content: "Translation, writing, vision and audio tools under a single calm interface.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@FlixoTools" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "search",
        type: "application/opensearchdescription+xml",
        title: "Flixo Tools",
        href: "/opensearch.xml",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Derive the active locale from the current location pathname so SSR renders the
 * correct `<html lang/dir>` for localized routes (e.g. `/ar`). Falls back to
 * `en` for non-localized routes. Client scripts (init-locale.js / I18nProvider)
 * may still refine the attribute after hydration; `suppressHydrationWarning`
 * on `<html>` keeps that safe.
 */
function useRouteLocale(): LocaleCode {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return useMemo(() => {
    if (pathname === "/ar" || pathname.startsWith("/ar/")) return "ar";
    return "en";
  }, [pathname]);
}

function RootShell({ children }: { children: ReactNode }) {
  const locale = useRouteLocale();
  const { dir } = localeMeta(locale);
  return (
    <html lang={locale} dir={dir} className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script src="/init-theme.js" />
        <script src="/init-locale.js" />
        <script src="/register-sw.js" />
        <JsonLd data={getJsonLdData()} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AnalyticsProvider>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </AnalyticsProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
