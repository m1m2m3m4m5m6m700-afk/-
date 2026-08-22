import type { WorkflowId } from '@/lib/workflows/types';

export type IntentSEOConfig = {
  readonly slug: string;
  readonly workflowId: WorkflowId;
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly preset?: Readonly<Record<string, string | undefined>>;
  readonly outcome: string;
};

export const INTENT_SLUGS_REGISTRY: readonly IntentSEOConfig[] = Object.freeze([
  { slug: 'salla-product-white-bg', workflowId: 'product-ready', title: 'Prepare Salla Product Photos with a Clean Background', description: 'Prepare product photos for Salla-style storefronts with a focused FLIXO workflow for background cleanup, framing, and web-ready output.', keywords: ['salla product photo', 'salla white background', 'product image for salla', 'ecommerce product photo'], preset: { background: 'clean', aspectRatio: '1:1' }, outcome: 'A clean square product image ready for a storefront.' },
  { slug: 'compress-id-photo-100kb', workflowId: 'web-ready', title: 'Compress an ID Photo Toward a 100KB Upload Target', description: 'Prepare an ID-style image for upload with a lighter web-ready file and a 100KB target where the source and format allow it.', keywords: ['compress id photo', 'id photo 100kb', 'reduce id image size', 'small image upload'], preset: { targetSizeKB: '100' }, outcome: 'A smaller image optimized toward the selected upload target.' },
  { slug: 'linkedin-profile-picture-hd', workflowId: 'profile-ready', title: 'Improve a LinkedIn Profile Picture', description: 'Use a focused FLIXO profile workflow to improve framing, optional background cleanup, and output size.', keywords: ['linkedin profile picture', 'linkedin photo enhancer', 'professional profile photo', 'linkedin headshot'], preset: { aspectRatio: '1:1' }, outcome: 'A clean, focused profile image for professional use.' },
  { slug: 'instagram-product-photo', workflowId: 'social-ready', title: 'Make a Product Photo Ready for Social Media', description: 'Create a share-ready product image with focused cropping, optional visual tuning, and web-friendly compression.', keywords: ['instagram product photo', 'social media product image', 'product post image', 'instagram shop image'], preset: { aspectRatio: '4:5' }, outcome: 'A social-ready product image without opening a full editor.' },
  { slug: 'website-image-optimize-webp', workflowId: 'web-ready', title: 'Optimize an Image for a Website', description: 'Resize, convert, and compress an image through a focused web-ready workflow with local processing where supported.', keywords: ['optimize image for website', 'website image compressor', 'convert image to webp', 'web image optimization'], preset: { format: 'image/webp' }, outcome: 'A lighter website-ready image.' },
  { slug: 'print-photo-high-resolution', workflowId: 'print-ready', title: 'Prepare a Photo for High-Resolution Print', description: 'Use FLIXO to increase resolution and optionally set print dimensions through a simple guided workflow.', keywords: ['high resolution print photo', 'prepare photo for printing', 'upscale image for print', 'print ready image'], preset: { scale: '2' }, outcome: 'A higher-resolution image ready for the next print step.' },
]);

export const getIntentSEO = (slug: string) => INTENT_SLUGS_REGISTRY.find((intent) => intent.slug === slug);
