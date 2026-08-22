import { createRoute } from '@tanstack/react-router';
import { Suspense, useMemo } from 'react';
import { LOCALES, isLocale } from '../lib/i18n';
import { getToolSeo } from '../lib/seo/tool-seo';
import { rootRoute } from './__root';

export const localizedToolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale/$tool',
  head: ({ params }) => {
    const seo = getToolSeo(params.locale, params.tool);
    if (!seo) return { meta: [{ title: 'FLIXO | Tool not found' }, { name: 'robots', content: 'noindex,nofollow' }] };

    return {
      meta: [
        { title: seo.title },
        { name: 'description', content: seo.description },
        { name: 'robots', content: 'index,follow,max-image-preview:large' },
        { property: 'og:title', content: seo.title },
        { property: 'og:description', content: seo.description },
        { property: 'og:url', content: seo.url },
        { property: 'og:locale', content: seo.languageTag },
      ],
      links: [
        { rel: 'canonical', href: seo.url },
        ...seo.alternates.map((alternate) => ({
          rel: 'alternate',
          hrefLang: alternate.languageTag,
          href: alternate.url,
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: `${seo.url.replace(/^https:\/\/[^/]+\/[^/]+/, `${seo.url.split('/').slice(0, 3).join('/')}/en`)}` },
      ],
    };
  },
  component: LocalizedToolPage,
});

function LocalizedToolPage() {
  const params = localizedToolRoute.useParams();
  const seo = useMemo(() => getToolSeo(params.locale, params.tool), [params.locale, params.tool]);

  if (!isLocale(params.locale) || !seo || !LOCALES.includes(params.locale)) {
    return <main><h1>Tool not found</h1></main>;
  }

  const ToolComponent = seo.tool.component;

  return (
    <main lang={seo.languageTag} dir={seo.direction}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.structuredData) }} />
      <Suspense fallback={<p>Loading FLIXO tool…</p>}>
        <ToolComponent />
      </Suspense>
    </main>
  );
}
