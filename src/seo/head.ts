import { absoluteSiteUrl, alternateLinks, softwareApplicationSchema, type SupportedLocale } from './site';

type ToolHeadInput = {
  title: string;
  description: string;
  pathname: string;
  language?: SupportedLocale;
  applicationCategory?: string;
};

export function toolHead(input: ToolHeadInput) {
  const language = input.language ?? 'en';
  const canonical = absoluteSiteUrl(input.pathname);
  const locale = language === 'ar' ? 'ar' : 'en_US';
  const alternates = alternateLinks(input.pathname).filter((item) => item.href);
  const schema = softwareApplicationSchema({
    name: input.title.replace(/\s*\|\s*FLIXO$/i, ''),
    description: input.description,
    pathname: input.pathname,
    language,
    applicationCategory: input.applicationCategory,
  });

  return {
    meta: [
      { title: input.title },
      { name: 'description', content: input.description },
      { name: 'robots', content: 'index,follow,max-image-preview:large' },
      { property: 'og:title', content: input.title },
      { property: 'og:description', content: input.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: locale },
      ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
      { property: 'og:site_name', content: 'FLIXO' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      ...(canonical ? [{ rel: 'canonical' as const, href: canonical }] : []),
      ...alternates,
    ],
    scripts: [{
      type: 'application/ld+json',
      children: JSON.stringify(schema),
    }],
  };
}
