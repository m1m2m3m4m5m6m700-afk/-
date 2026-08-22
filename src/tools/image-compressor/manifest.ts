import type { ToolManifest } from '@/lib/seo/tool-manifest';
import { ar } from './seo/ar';
import { en } from './seo/en';

export const IMAGE_COMPRESSOR_MANIFEST: ToolManifest = Object.freeze({
  toolId: 'image-compressor',
  slug: 'image-compressor',
  status: 'ready',
  seoStatus: 'pilot',
  capabilities: ['client-side', 'batch', 'resize', 'target-size', 'webp', 'jpg', 'png'] as const,
  seoLocales: Object.freeze({ en, ar }),
});
