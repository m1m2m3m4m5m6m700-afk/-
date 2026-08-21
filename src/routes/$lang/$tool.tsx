import { createRoute } from '@tanstack/react-router';
import { getLanguageConfig, isLocaleCode, type LocaleCode } from '../../config/i18n';
import { getLocale } from '../../i18n';
import { isValidRoute } from '../../config/routes-contract';
import { TOOLS_REGISTRY } from '../../config/tools';
import { absoluteLocaleUrl, buildHreflangLinks, buildOgImageUrl, buildWebApplicationJsonLd, getOgLocale, getPrivacyMessage, toJsonLdScript } from '../../seo/localized-seo';
import { rootRoute } from '../__root';

const toAbsoluteUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) return value;
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, '');
  if (configured) return new URL(value, `${configured}/`).href;
  if (typeof window !== 'undefined') return new URL(value, window.location.origin).href;
  return value;
};

const localeHeadScript = (localeCode: string): string => {
  const dir = getLanguageConfig(localeCode).dir;
  return `document.documentElement.lang=${JSON.stringify(localeCode)};document.documentElement.dir=${JSON.stringify(dir)};`;
};

export const localizedToolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$lang/$tool',
  head: ({ params }) => {
    const validLocale = isLocaleCode(params.lang) ? params.lang : 'en';
    const tool = TOOLS_REGISTRY.find((item) => item.id === params.tool);
    const locale = getLocale(validLocale);
    const headScript = { type: 'text/javascript', children: localeHeadScript(validLocale) };

    if (!tool || !isValidRoute(params.lang, params.tool)) {
      return {
        meta: [
          { title: '404 | FLIXO' },
          { name: 'robots', content: 'noindex,nofollow' },
          { name: 'content-language', content: validLocale },
        ],
        scripts: [headScript],
      };
    }

    const translated = locale.tools[tool.id] ?? { title: tool.title, description: tool.description };
    const canonicalUrl = toAbsoluteUrl(absoluteLocaleUrl(validLocale, tool.path));
    const links = buildHreflangLinks(tool.path).map((link) => ({ rel: link.rel, hrefLang: link.hreflang, href: toAbsoluteUrl(link.href) }));
    const schema = buildWebApplicationJsonLd(validLocale, tool.id);

    return {
      meta: [
        { title: `${translated.title} | FLIXO` },
        { name: 'description', content: translated.description },
        { name: 'robots', content: 'index,follow,max-image-preview:large' },
        { property: 'og:title', content: `${translated.title} | FLIXO` },
        { property: 'og:description', content: translated.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: toAbsoluteUrl(buildOgImageUrl(validLocale, tool.id)) },
        { property: 'og:locale', content: getOgLocale(validLocale) },
        { property: 'og:site_name', content: 'FLIXO' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${translated.title} | FLIXO` },
        { name: 'twitter:description', content: translated.description },
        { name: 'twitter:image', content: toAbsoluteUrl(buildOgImageUrl(validLocale, tool.id)) },
        { name: 'content-language', content: validLocale },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }, ...links],
      scripts: [headScript, ...(schema ? [{ type: 'application/ld+json', children: toJsonLdScript(schema) }] : [])],
    };
  },
  component: function LocalizedToolPage() {
    const { lang, tool } = localizedToolRoute.useParams();
    const valid = isValidRoute(lang, tool);
    const localeCode = (isLocaleCode(lang) ? lang : 'en') as LocaleCode;
    const locale = getLocale(localeCode);
    const config = TOOLS_REGISTRY.find((item) => item.id === tool);

    if (!valid || !config) {
      return (
        <main className="home-shell">
          <div className="home-container" lang={localeCode} dir={getLanguageConfig(localeCode).dir}>
            <h1>404</h1>
            <p>Tool not found.</p>
          </div>
        </main>
      );
    }

    const translated = locale.tools[config.id] ?? { title: config.title, description: config.description };
    const Component = config.component;
    return (
      <main dir={getLanguageConfig(localeCode).dir} lang={localeCode}>
        <div className="home-container">
          <header className="mb-6">
            <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">{translated.title}</p>
            <p className="home-lead">{translated.description}</p>
            <p className="mt-3 rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300" aria-label="Privacy notice">
              {getPrivacyMessage(localeCode)}
            </p>
          </header>
          <Component />
        </div>
      </main>
    );
  },
});
