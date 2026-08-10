import type { Category } from "@/data/categories";
import type { ToolSeoData } from "@/data/toolSeo";
import type { ToolEeAtMetadata } from "@/data/toolContent";
import type { LocaleCode } from "@/lib/i18n";
import {
  SITE_DISPLAY_NAME,
  SITE_NAME,
  SITE_TWITTER_HANDLE,
  SITE_URL,
  getCategoryCanonicalUrl,
  getDefaultOgImageUrl,
  getToolCanonicalUrl,
} from "./site";

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [`https://twitter.com/${SITE_TWITTER_HANDLE.replace(/^@/, "")}`],
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_DISPLAY_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/#search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildRootWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Flixo brings translation, image, PDF, writing, video, audio and developer tools into one fast, private workspace.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    image: getDefaultOgImageUrl(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildToolStructuredData({
  slug,
  toolName,
  categoryName,
  category,
  seo,
  eeat,
  locale = "en",
}: {
  slug: string;
  toolName: string;
  categoryName: string;
  category?: Category;
  seo: ToolSeoData;
  eeat: ToolEeAtMetadata;
  locale?: LocaleCode;
}) {
  const pageUrl = getToolCanonicalUrl(slug, locale);
  const categoryUrl = category
    ? getCategoryCanonicalUrl(category.id)
    : `${SITE_URL}/categories/utilities`;

  const homeName = locale === "ar" ? "الرئيسية" : "Home";
  const homeUrl = locale ? `${SITE_URL}/${locale}` : SITE_URL;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: seo.title,
      url: pageUrl,
      description: seo.description,
      inLanguage: locale === "ar" ? "ar" : "en",
      applicationCategory: categoryName || "UtilityApplication",
      operatingSystem: eeat.supportedPlatforms.join(", "),
      browserRequirements: "Requires Web browser",
      image: getDefaultOgImageUrl(),
      author: {
        "@type": "Organization",
        name: eeat.author,
      },
      dateModified: eeat.lastUpdated,
      softwareVersion: eeat.version,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: toolName,
      inLanguage: locale === "ar" ? "ar" : "en",
      operatingSystem: eeat.supportedPlatforms.join(", "),
      applicationCategory: categoryName,
      description: seo.description,
      url: pageUrl,
      softwareVersion: eeat.version,
      author: {
        "@type": "Organization",
        name: eeat.author,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Processing type",
          value: eeat.processingType,
        },
        {
          "@type": "PropertyValue",
          name: "Privacy statement",
          value: eeat.privacyStatement,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: homeName,
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: categoryName || "Tools",
          item: categoryUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: toolName,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    buildOrganizationSchema(),
    buildWebSiteSchema(),
  ];
}
