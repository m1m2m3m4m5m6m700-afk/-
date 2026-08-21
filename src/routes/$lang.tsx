import { createRoute, Link } from '@tanstack/react-router';
import { getLocale } from '../i18n';
import { isLocaleCode } from '../config/i18n';
import { TOOLS_REGISTRY } from '../config/tools';
import { rootRoute } from './__root';

export const localeHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$lang',
  head: ({ params }) => {
    const locale = getLocale(params.lang);
    return { meta: [
      { title: `${locale.homeTitle} | FLIXO` },
      { name: 'description', content: locale.homeLead },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
    ] };
  },
  component: function LocalizedHomePage() {
    const { lang } = localeHomeRoute.useParams();
    if (!isLocaleCode(lang)) return <main className="home-shell"><div className="home-container"><h1>404</h1></div></main>;
    const locale = getLocale(lang);
    if (typeof document !== 'undefined') { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'; }
    return <main className="home-shell" dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}><div className="home-container"><p className="image-tool-eyebrow">{locale.eyebrow}</p><h1>{locale.homeTitle}</h1><p className="home-lead">{locale.homeLead}</p><div className="compressor-grid">{TOOLS_REGISTRY.map((tool) => { const t = locale.tools[tool.id] ?? { title: tool.title, description: tool.description }; return <Link key={tool.id} className="compressor-card" to="/$lang/$tool" params={{ lang, tool: tool.id }}>{t.title}<span>{t.description}</span></Link>; })}</div></div></main>;
  },
});
