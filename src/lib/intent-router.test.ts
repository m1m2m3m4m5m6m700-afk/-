import { describe, expect, it } from 'vitest';
import type { ToolConfig } from '@/config/tools';
import { findToolIntent, getBestToolIntent } from './intent-router';

const tool = (id: string, title: string, isReady = true): ToolConfig => ({
  id,
  title,
  path: `/en/${id}`,
  description: `${title} description`,
  isReady,
  component: undefined as never,
});

describe('intent router', () => {
  const tools = [
    tool('image-compressor', 'Image Compressor'),
    tool('background-remover', 'Background Remover'),
    tool('image-ocr', 'Image OCR'),
    tool('photo-colorizer', 'Photo Colorizer', false),
  ];

  it('matches English intent', () => {
    expect(getBestToolIntent('compress image', tools)?.tool.id).toBe('image-compressor');
  });

  it('matches Arabic intent', () => {
    expect(getBestToolIntent('إزالة الخلفية', tools)?.tool.id).toBe('background-remover');
  });

  it('never returns a non-ready tool', () => {
    expect(findToolIntent('colorize photo', tools).some(({ tool: match }) => match.id === 'photo-colorizer')).toBe(false);
  });
});
