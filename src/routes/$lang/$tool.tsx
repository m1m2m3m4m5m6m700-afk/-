import { createRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { getLanguageConfig, isLocaleCode, SUPPORTED_LANGUAGES } from '../../config/i18n';
import { getLocale, localePath } from '../../i18n';
import { TOOLS_REGISTRY } from '../../config/tools';
import { rootRoute } from '../__root';

export const localizedToolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$lang/$tool',
  head: ({ params }) => {
    const locale = getLocale(params.lang); const tool = TOOLS_REGISTRY.find((item) => item.id === params.tool);
    if (!tool) return { meta: [{ title: '404 | FLIXO' }, { name: 'robots', content: 'noindex,nofollow' }] };
    const validLocale = isLocaleCode(params.lang) ? params.lang : 'en';
    const translated = locale.tools[tool.id] ?? { title: tool.title, description: tool.description };
    const canonicalPath = localePath(validLocale, tool.path);
    const links = SUPPORTED_LANGUAGES.map((language) => ({ rel: 'alternate', hrefLang: language.code, href: localePath(language.code, tool.path) }));
    return { meta: [
      { title: `${translated.title} | FLIXO` },
      { name: 'description', content: translated.description },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
      { property: 'og:title', content: `${translated.title} | FLIXO` },
      { property: 'og:description', content: translated.description },
      { property: 'og:type', content: 'website' },
    ], links: [{ rel: 'canonical', href: canonicalPath }, ...links] };
  },
  component: function LocalizedToolPage() {
    const { lang, tool } = localizedToolRoute.useParams();
    const valid = isLocaleCode(lang); const locale = getLocale(lang); const config = TOOLS_REGISTRY.find((item) => item.id === tool);
    useEffect(() => { document.documentElement.lang = valid ? lang : 'en'; document.documentElement.dir = valid ? getLanguageConfig(lang).dir : 'ltr'; }, [lang, valid]);
    if (!valid || !config) return <main className="home-shell"><div className="home-container"><h1>404</h1></div></main>;
    const translated = locale.tools[config.id] ?? { title: config.title, description: config.description };
    const Component = config.component;
    return <main dir={getLanguageConfig(lang).dir}><div className="home-container"><header className="mb-6"><h1>{translated.title}</h1><p className="home-lead">{translated.description}</p></header><Component /></div></main>;
  },
});
