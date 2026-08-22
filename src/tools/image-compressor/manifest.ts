import type { Locale } from '@/lib/i18n';

export type ToolSeoStatus = 'pilot' | 'complete';

export type LocalizedToolSeo = Readonly<{
  title: string;
  description: string;
  intro: string;
  keywords: readonly string[];
  howTo: readonly string[];
  features: readonly string[];
  altText: readonly string[];
}>;

export type ToolManifest = Readonly<{
  toolId: 'image-compressor';
  slug: 'image-compressor';
  status: 'ready';
  seoStatus: ToolSeoStatus;
  capabilities: readonly ['client-side', 'batch', 'resize', 'target-size', 'webp', 'jpg', 'png'];
  seoLocales: Readonly<Partial<Record<Locale, LocalizedToolSeo>>>;
}>;

import { ar } from './seo/ar';
import { en } from './seo/en';

export const IMAGE_COMPRESSOR_MANIFEST: ToolManifest = Object.freeze({
  toolId: 'image-compressor',
  slug: 'image-compressor',
  status: 'ready',
  seoStatus: 'pilot',
  capabilities: ['client-side', 'batch', 'resize', 'target-size', 'webp', 'jpg', 'png'],
  seoLocales: Object.freeze({ en, ar }),
});
