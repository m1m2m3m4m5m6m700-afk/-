export const SITE_URL = "https://flixotools.com";
export const SITE_NAME = "Flixo";
export const SITE_DISPLAY_NAME = "Flixo Tools";
export const SITE_TWITTER_HANDLE = "@FlixoTools";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";
export const DEFAULT_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const NOINDEX_ROBOTS = "noindex, nofollow";

export const getDefaultOgImageUrl = (origin: string = SITE_URL) =>
  `${origin}${DEFAULT_OG_IMAGE_PATH}`;
export const stripQueryAndHash = (url: string) => url.split("?")[0].split("#")[0];
export const getToolCanonicalUrl = (slug: string, locale?: string) =>
  locale ? `${SITE_URL}/${locale}/tools/${slug}` : `${SITE_URL}/tools/${slug}`;
export const getCategoryCanonicalUrl = (slug: string) => `${SITE_URL}/categories/${slug}`;
export const getAbsoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
