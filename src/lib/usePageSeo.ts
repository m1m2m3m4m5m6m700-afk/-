import { useEffect } from "react";
import { type ToolSeoData } from "@/data/toolSeo";
import { SITE_NAME, SITE_TWITTER_HANDLE, getToolCanonicalUrl } from "@/lib/seo/site";
import { resolvePageSeo } from "@/lib/seo/toolPageMetadata";
import type { LocaleCode } from "@/lib/i18n";

export function usePageSeo(
  slug?: string,
  customData?: Partial<ToolSeoData>,
  locale: LocaleCode = "en",
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { title, description, keywords, robots, pageUrl, canonicalUrl, ogImage } = resolvePageSeo(
      slug,
      customData,
      locale,
    );

    document.title = title;

    const setMeta = (nameAttr: string, valueAttr: string, content: string) => {
      let element = document.querySelector(
        `meta[${nameAttr}="${valueAttr}"]`,
      ) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(nameAttr, valueAttr);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const setCanonical = (url: string) => {
      let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
        document.head.appendChild(element);
      }
      element.setAttribute("href", url);
    };

    const setHreflang = (lang: string, href: string) => {
      let element = document.querySelector(
        `link[rel="alternate"][hreflang="${lang}"]`,
      ) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "alternate");
        element.setAttribute("hreflang", lang);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords.join(", "));
    setMeta("name", "robots", robots);
    setCanonical(canonicalUrl);

    if (slug) {
      setHreflang("en", getToolCanonicalUrl(slug, "en"));
      setHreflang("ar", getToolCanonicalUrl(slug, "ar"));
      setHreflang("x-default", getToolCanonicalUrl(slug));
    }

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", pageUrl);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:locale", locale === "ar" ? "ar_AR" : "en_US");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:site", SITE_TWITTER_HANDLE);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
  }, [slug, customData, locale]);
}
