import { createRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { getLanguageConfig, isLocaleCode, type LocaleCode } from '../../config/i18n';
import { getLocale, localePath } from '../../i18n';
import { TOOLS_REGISTRY } from '../../config/tools';
import { buildHreflangLinks, buildWebApplicationJsonLd, getPrivacyMessage, toJsonLdScript } from '../../seo/localized-seo';
import { rootRoute } from '../__root';

export const localizedToolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$lang/$tool',
  head: ({ params }) => {
    const tool = TOOLS_REGISTRY.find((item) => item.id === params.tool);
    const validLocale = isLocaleCode(params.lang) ? params.lang : 'en';
    const locale = getLocale(validLocale);
    if (!tool) return { meta: [{ title: '404 | FLIXO' }, { name: 'robots', content: 'noindex,nofollow' }] };
    const translated = locale.tools[tool.id] ?? { title: tool.title, description: tool.description };
    const canonicalPath = localePath(validLocale, tool.path);
    const links = buildHreflangLinks(tool.path).map((link) => ({ rel: link.rel, hrefLang: link.hreflang, href: link.href }));
    const schema = buildWebApplicationJsonLd(validLocale, tool.id);
    return {
      meta: [
        { title: `${translated.title} | FLIXO` },
        { name: 'description', content: translated.description },
        { name: 'robots', content: 'index,follow,max-image-preview:large' },
        { property: 'og:title', content: `${translated.title} | FLIXO` },
        { property: 'og:description', content: translated.description },
        { property: 'og:type', content: 'website' },
        { name: 'content-language', content: validLocale },
      ],
      links: [{ rel: 'canonical', href: canonicalPath }, ...links],
      scripts: schema ? [{ type: 'application/ld+json', children: toJsonLdScript(schema) }] : [],
    };
  },
  component: function LocalizedToolPage() {
    const { lang, tool } = localizedToolRoute.useParams();
    const valid = isLocaleCode(lang); const localeCode = (valid ? lang : 'en') as LocaleCode;
    const locale = getLocale(localeCode); const config = TOOLS_REGISTRY.find((item) => item.id === tool);
    useEffect(() => { document.documentElement.lang = localeCode; document.documentElement.dir = getLanguageConfig(localeCode).dir; }, [localeCode]);
    if (!valid || !config) return <main className="home-shell"><div className="home-container"><h1>404</h1></div></main>;
    const translated = locale.tools[config.id] ?? { title: config.title, description: config.description };
    const Component = config.component;
    return <main dir={getLanguageConfig(localeCode).dir}>
      <div className="home-container">
        <header className="mb-6">
          <h1>{translated.title}</h1>
          <p className="home-lead">{translated.description}</p>
          <p className="mt-3 rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300" aria-label="Privacy notice">
            {getPrivacyMessage(localeCode)}
          </p>
        </header>
        <Component />
      </div>
    </main>;
  },
});
