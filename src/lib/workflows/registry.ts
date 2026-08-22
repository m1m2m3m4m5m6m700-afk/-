import type { Workflow } from './types';

export const WORKFLOW_REGISTRY: readonly Workflow[] = Object.freeze([
  {
    id: 'product-ready',
    title: 'Product Ready',
    description: 'Prepare a clean, sharp product image for a store or marketplace.',
    intentPatterns: ['product', 'store', 'shop', 'ecommerce', 'amazon', 'marketplace', 'catalog'],
    steps: [
      { toolId: 'background-remover', title: 'Remove background' },
      { toolId: 'image-upscaler', title: 'Improve quality', optional: true },
      { toolId: 'image-cropper', title: 'Set the crop', optional: true },
      { toolId: 'image-compressor', title: 'Optimize file size' },
    ],
  },
  {
    id: 'social-ready',
    title: 'Social Ready',
    description: 'Turn an image into a clean, share-ready social asset.',
    intentPatterns: ['social', 'instagram', 'facebook', 'post', 'story', 'social media'],
    steps: [
      { toolId: 'image-cropper', title: 'Set the crop' },
      { toolId: 'image-effects', title: 'Tune the look', optional: true },
      { toolId: 'image-compressor', title: 'Optimize for sharing' },
    ],
  },
  {
    id: 'profile-ready',
    title: 'Profile Ready',
    description: 'Create a clean portrait image for a profile or ID-style use.',
    intentPatterns: ['profile', 'avatar', 'headshot', 'portrait', 'id photo'],
    steps: [
      { toolId: 'background-remover', title: 'Clean the background', optional: true },
      { toolId: 'image-cropper', title: 'Frame the portrait' },
      { toolId: 'image-compressor', title: 'Keep the file light' },
    ],
  },
  {
    id: 'web-ready',
    title: 'Web Ready',
    description: 'Make an image lighter and appropriately sized for a website.',
    intentPatterns: ['website', 'web', 'site', 'homepage', 'landing page', 'online'],
    steps: [
      { toolId: 'image-cropper', title: 'Set the dimensions', optional: true },
      { toolId: 'image-converter', title: 'Choose the right format', optional: true },
      { toolId: 'image-compressor', title: 'Compress for the web' },
    ],
  },
  {
    id: 'print-ready',
    title: 'Print Ready',
    description: 'Prepare an image for cleaner, higher-resolution output.',
    intentPatterns: ['print', 'printing', 'poster', 'flyer', 'paper', 'high resolution'],
    steps: [
      { toolId: 'image-upscaler', title: 'Increase resolution' },
      { toolId: 'image-cropper', title: 'Set print dimensions', optional: true },
    ],
  },
  {
    id: 'improve-image',
    title: 'Improve Image',
    description: 'Start with the most common quality improvements without learning the tools.',
    intentPatterns: ['improve', 'enhance', 'better', 'sharper', 'quality', 'fix image', 'clean image'],
    steps: [
      { toolId: 'image-upscaler', title: 'Improve quality' },
      { toolId: 'image-effects', title: 'Tune the look', optional: true },
      { toolId: 'background-blur', title: 'Blur the background', optional: true },
    ],
  },
]);

export const getWorkflow = (id: string) => WORKFLOW_REGISTRY.find((workflow) => workflow.id === id);
