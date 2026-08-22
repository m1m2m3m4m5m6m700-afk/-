import type { ToolManifest } from '@/lib/seo/tool-manifest';
import { ar } from './seo/ar';
import { en } from './seo/en';

export const BACKGROUND_REMOVER_MANIFEST: ToolManifest = Object.freeze({
  toolId: 'background-remover',
  slug: 'background-remover',
  status: 'ready',
  seoStatus: 'pilot',
  capabilities: ['client-side', 'connected-background', 'preview'] as const,
  seoLocales: Object.freeze({ en, ar }),
});
