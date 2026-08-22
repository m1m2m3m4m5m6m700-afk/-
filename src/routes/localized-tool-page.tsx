import { Suspense } from 'react';
import { LOCALES, isLocale } from '../lib/i18n';
import { getToolSeo } from '../lib/seo/tool-seo';
import { localizedToolRoute } from './localized-tool';

export function LocalizedToolPage() {
  const params = localizedToolRoute.useParams();
  const seo = getToolSeo(params.locale, params.tool);

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
