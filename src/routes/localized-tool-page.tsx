import { Suspense } from 'react';
import { useParams } from '@tanstack/react-router';
import { LOCALES, isLocale } from '../lib/i18n';
import { getToolSeo } from '../lib/seo/tool-seo';

export function LocalizedToolPage() {
  const params = useParams({ strict: false });
  const seo = getToolSeo(params.locale, params.tool);

  if (!isLocale(params.locale) || !seo || !LOCALES.includes(params.locale)) {
    return <main><h1>Tool not found</h1></main>;
  }

  const ToolComponent = seo.tool.component;

  return (
    <main lang={seo.languageTag} dir={seo.direction}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.structuredData).replace(/</g, '\\u003c') }} />
      <Suspense fallback={<p>Loading FLIXO tool…</p>}>
        <ToolComponent />
      </Suspense>
    </main>
  );
}
