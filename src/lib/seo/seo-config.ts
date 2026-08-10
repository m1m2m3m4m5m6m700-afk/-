import {
  SITE_NAME,
  SITE_DISPLAY_NAME,
  SITE_URL,
  SITE_TWITTER_HANDLE,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_ROBOTS,
  getDefaultOgImageUrl,
  getToolCanonicalUrl,
  getCategoryCanonicalUrl,
} from "./site";
import type { ToolSeoData, ToolFaqItem } from "@/data/toolSeo";
import type { ToolEeAtMetadata } from "@/data/toolContent";
import type { Tool } from "@/data/tools";
import type { Category } from "@/data/categories";

export interface OpenGraphDefaults {
  title: string;
  description: string;
  type: string;
  url: string;
  siteName: string;
  image: string;
  locale: string;
  alternateLocales?: string[];
}

export interface TwitterCardConfig {
  card: "summary" | "summary_large_image" | "app" | "player";
  site: string;
  creator?: string;
  title: string;
  description: string;
  image: string;
}

export interface StructuredJsonLdConfig {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

export interface SeoMetadataSchema {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  robots: string;
  openGraph: OpenGraphDefaults;
  twitter: TwitterCardConfig;
  jsonLd: StructuredJsonLdConfig[];
}

export const DEFAULT_OPENGRAPH_CONFIG: OpenGraphDefaults = {
  title: `${SITE_DISPLAY_NAME} — Free Online Tools & Utilities`,
  description:
    "Flixo brings translation, image, PDF, writing, video, audio, and developer tools into one fast, private browser workspace.",
  type: "website",
  url: SITE_URL,
  siteName: SITE_NAME,
  image: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
  locale: "en_US",
  alternateLocales: ["ar_SA", "es_ES", "fr_FR", "de_DE", "zh_CN", "ja_JP"],
};

export const DEFAULT_TWITTER_CONFIG: TwitterCardConfig = {
  card: "summary_large_image",
  site: SITE_TWITTER_HANDLE,
  creator: SITE_TWITTER_HANDLE,
  title: `${SITE_DISPLAY_NAME} — Free Online Tools & Utilities`,
  description:
    "Flixo brings translation, image, PDF, writing, video, audio, and developer tools into one fast, private browser workspace.",
  image: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
};

export const DEFAULT_SEO_CONFIG = {
  siteName: SITE_NAME,
  siteDisplayName: SITE_DISPLAY_NAME,
  siteUrl: SITE_URL,
  twitterHandle: SITE_TWITTER_HANDLE,
  defaultRobots: DEFAULT_ROBOTS,
  openGraph: DEFAULT_OPENGRAPH_CONFIG,
  twitter: DEFAULT_TWITTER_CONFIG,
};

/**
 * Generate Organization JSON-LD Schema
 */
export function generateOrganizationJsonLd(): StructuredJsonLdConfig {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [`https://twitter.com/${SITE_TWITTER_HANDLE.replace(/^@/, "")}`],
    description: "Flixo provides browser-native tools for productive workflows.",
  };
}

/**
 * Generate WebSite JSON-LD Schema with SearchAction
 */
export function generateWebSiteJsonLd(): StructuredJsonLdConfig {
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

/**
 * Generate SoftwareApplication JSON-LD Schema for a tool
 */
export function generateSoftwareApplicationJsonLd(options: {
  toolName: string;
  description: string;
  url: string;
  categoryName?: string;
  version?: string;
  author?: string;
  ratingValue?: string;
  ratingCount?: string;
  processingType?: string;
  privacyStatement?: string;
}): StructuredJsonLdConfig {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: options.toolName,
    description: options.description,
    url: options.url,
    applicationCategory: options.categoryName || "UtilityApplication",
    operatingSystem: "All",
    softwareVersion: options.version || "1.0.0",
    author: {
      "@type": "Organization",
      name: options.author || "Flixo Core Team",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    ...(options.ratingValue && options.ratingCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: options.ratingValue,
            ratingCount: options.ratingCount,
          },
        }
      : {}),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Processing Type",
        value: options.processingType || "Client-Side Privacy Preserving",
      },
      {
        "@type": "PropertyValue",
        name: "Privacy Statement",
        value: options.privacyStatement || "No file data uploaded or logged.",
      },
    ],
  };
}

/**
 * Generate BreadcrumbList JSON-LD Schema
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): StructuredJsonLdConfig {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage JSON-LD Schema
 */
export function generateFaqJsonLd(faqs: ToolFaqItem[]): StructuredJsonLdConfig {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Build complete Tool SEO Metadata Object
 */
export function buildToolSeoSchema(params: {
  tool: Tool;
  seoData: ToolSeoData;
  eeatData?: ToolEeAtMetadata;
  category?: Category;
}): SeoMetadataSchema {
  const { tool, seoData, eeatData, category } = params;
  const slug = tool.slug || tool.id;
  const canonicalUrl = getToolCanonicalUrl(slug);
  const ogImage = getDefaultOgImageUrl();
  const categoryName = category?.name || tool.categoryId;
  const categoryUrl = category
    ? getCategoryCanonicalUrl(category.id)
    : `${SITE_URL}/categories/${tool.categoryId.toLowerCase()}`;

  const jsonLd: StructuredJsonLdConfig[] = [
    generateSoftwareApplicationJsonLd({
      toolName: tool.name,
      description: seoData.description,
      url: canonicalUrl,
      categoryName,
      version: eeatData?.version,
      author: eeatData?.author,
      processingType: eeatData?.processingType,
      privacyStatement: eeatData?.privacyStatement,
    }),
    generateBreadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: categoryName, url: categoryUrl },
      { name: tool.name, url: canonicalUrl },
    ]),
    generateFaqJsonLd(seoData.faqs || []),
    generateOrganizationJsonLd(),
    generateWebSiteJsonLd(),
  ];

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords || [],
    canonicalUrl,
    robots: DEFAULT_ROBOTS,
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      type: "website",
      url: canonicalUrl,
      siteName: SITE_NAME,
      image: ogImage,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_TWITTER_HANDLE,
      creator: SITE_TWITTER_HANDLE,
      title: seoData.title,
      description: seoData.description,
      image: ogImage,
    },
    jsonLd,
  };
}
