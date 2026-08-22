import { describe, expect, it } from 'vitest';
import { resolveIntent } from '@/lib/intent/resolver';

describe('FLIXO intent resolver', () => {
  it('routes product intent to Product Ready workflow', () => {
    const match = resolveIntent('make this product photo ready for my store');
    expect(match.kind).toBe('workflow');
    expect(match.id).toBe('product-ready');
    expect(match.confidence).toBeGreaterThanOrEqual(0.72);
  });

  it('routes compression intent to Image Compressor', () => {
    const match = resolveIntent('make this image smaller');
    expect(match.kind).toBe('tool');
    expect(match.id).toBe('image-compressor');
  });

  it('routes quality intent to Improve Image workflow', () => {
    const match = resolveIntent('make this photo sharper and higher quality');
    expect(match.id).toBe('improve-image');
  });

  it('returns none for unsupported vague input', () => {
    const match = resolveIntent('hello there');
    expect(match.kind).toBe('none');
    expect(match.id).toBeNull();
  });
});
