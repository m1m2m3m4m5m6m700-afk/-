import { Suspense, useEffect, useState } from 'react';
import { getToolConfig } from '../config/tools';
import { TranslationProvider } from '../i18n/context';
import { loadLocale } from '../i18n/loader';
import { getLocale } from '../i18n/catalog';
import type { SupportedLanguage, TranslationSchema } from '../i18n/schema';
import { absoluteSiteUrl, alternateLinks, softwareApplicationSchema } from '../seo/site';
import { canonicalToolPath } from '../seo/routes';

export type LocalizedToolRouteProps = {
  language: SupportedLanguage;
  toolId: string;
};

function setDocumentLanguage(language: SupportedLanguage, dir: TranslationSchema['dir']) {
  document.documentElement.lang = language;
  document.documentElement.dir = dir;
}

export function localizedToolHead({ language, toolId }: LocalizedToolRouteProps) {
  const locale = getLocale(language);
  const toolConfig = getToolConfig(toolId);
  const tool = locale.tools[toolId as keyof typeof locale.tools];
  if (!tool || !toolConfig?.isReady) return { meta: [{ name: 'robots', content: 'noindex,follow' }] };

  const pathname = `/${language}/${toolId}`;
  const canonical = absoluteSiteUrl(pathname);
  return {
    meta: [
      { title: `${tool.title} | FLIXO` },
      { name: 'description', content: tool.description },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
      { property: 'og:title', content: tool.title },
      { property: 'og:description', content: tool.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: language },
      { property: 'og:url', content: canonical ?? pathname },
    ],
    links: [
      ...(canonical ? [{ rel: 'canonical' as const, href: canonical }] : []),
      ...alternateLinks(pathname),
    ],
    scripts: [{
      type: 'application/ld+json',
      children: JSON.stringify(softwareApplicationSchema({ name: tool.title, description: tool.description, pathname, language })),
    }],
  };
}

export function LocalizedToolPage({ language, toolId }: LocalizedToolRouteProps) {
  const tool = getToolConfig(toolId);
  const locale = getLocale(language);
  const [runtimeLocale, setRuntimeLocale] = useState<TranslationSchema>(locale);

  useEffect(() => {
    setDocumentLanguage(language, locale.dir);
    let active = true;
    void loadLocale(language).then((loaded) => {
      if (active) setRuntimeLocale(loaded);
    });
    return () => { active = false; };
  }, [language, locale.dir]);

  if (!tool || !tool.isReady) {
    return (
      <main className="image-tool-shell" data-testid="not-found-page">
        <div className="image-tool-container">
          <p className="image-tool-eyebrow">FLIXO</p>
          <h1>{runtimeLocale.common.notFoundTitle}</h1>
          <p className="image-tool-lead">{runtimeLocale.common.notFoundDescription}</p>
        </div>
      </main>
    );
  }

  const translated = runtimeLocale.tools[toolId as keyof typeof runtimeLocale.tools];
  const Component = tool.component;

  return (
    <TranslationProvider locale={runtimeLocale}>
      <main dir={runtimeLocale.dir} className="localized-tool-page" data-language={language} data-tool={toolId}>
        <section className="localized-tool-header image-tool-container">
          <p className="image-tool-eyebrow">FLIXO · {language.toUpperCase()}</p>
          <h2>{translated.title}</h2>
          <p className="image-tool-lead">{translated.description}</p>
          <p className="privacy-note">{runtimeLocale.common.privacy}</p>
        </section>
        <div className="localized-tool-body">
          <Suspense fallback={<div className="image-tool-container" aria-live="polite">{runtimeLocale.common.processing}…</div>}>
            <Component />
          </Suspense>
        </div>
      </main>
    </TranslationProvider>
  );
}

export function makeLocalizedToolRoutePath(language: SupportedLanguage, toolId: string) {
  return canonicalToolPath(language, toolId);
}
