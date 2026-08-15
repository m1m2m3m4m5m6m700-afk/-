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
import { localeFromPathname, localeMeta, type LocaleCode } from "../lib/i18n";

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
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
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
      { title: "Flixo tools" },
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
      { property: "og:image", content: "https://flixoai.vercel.app/flixo-official-logo.svg" },
      { property: "og:image:alt", content: "Official Flixo AI logo — All Tools. One Place." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@FlixoTools" },
      { name: "twitter:image", content: "https://flixoai.vercel.app/flixo-official-logo.svg" },
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
      { rel: "icon", href: "/flixo-mark.svg", type: "image/svg+xml", sizes: "512x512" },
      { rel: "apple-touch-icon", href: "/flixo-mark.svg" },
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

function useRouteLocale(): LocaleCode {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return useMemo(() => localeFromPathname(pathname), [pathname]);
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
            <Outlet />
          </AnalyticsProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
