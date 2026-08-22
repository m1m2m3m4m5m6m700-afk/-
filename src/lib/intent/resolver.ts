import { TOOLS_REGISTRY, type ToolConfig } from '@/config/tools';
import { WORKFLOW_REGISTRY } from '@/lib/workflows/registry';
import type { IntentMatch } from '@/lib/workflows/types';
import { includesTerm, normalizeIntent } from './normalize';

type KeywordRule = {
  readonly id: ToolConfig['id'];
  readonly terms: readonly string[];
};

const TOOL_RULES: readonly KeywordRule[] = Object.freeze([
  { id: 'image-compressor', terms: ['compress', 'smaller', 'reduce size', 'file size', 'lighter'] },
  { id: 'background-remover', terms: ['remove background', 'transparent background', 'cut out background', 'background removal'] },
  { id: 'image-upscaler', terms: ['upscale', 'sharper', 'higher quality', 'increase resolution', 'make it clearer'] },
  { id: 'image-converter', terms: ['convert format', 'jpg to png', 'png to jpg', 'webp', 'change format'] },
  { id: 'image-ocr', terms: ['ocr', 'extract text', 'text from image', 'read text'] },
  { id: 'image-cropper', terms: ['crop', 'resize', 'dimensions', 'aspect ratio'] },
  { id: 'image-effects', terms: ['brightness', 'contrast', 'saturation', 'grayscale', 'adjust image'] },
  { id: 'watermark-remover', terms: ['remove watermark', 'erase watermark'] },
  { id: 'object-remover', terms: ['remove object', 'erase object', 'delete object'] },
  { id: 'ai-image-generator', terms: ['generate image', 'create image with ai', 'text to image', 'make an image'] },
]);

const score = (normalized: string, terms: readonly string[]) => {
  const matchedTerms = terms.filter((term) => includesTerm(normalized, term));
  return { matchedTerms, value: matchedTerms.length };
};

const resolveBest = <T extends { readonly id: string; readonly intentPatterns: readonly string[] }>(
  normalized: string,
  candidates: readonly T[],
): IntentMatch => {
  let winner: { candidate: T; matchedTerms: string[]; value: number } | null = null;
  for (const candidate of candidates) {
    const result = score(normalized, candidate.intentPatterns);
    if (result.value === 0) continue;
    if (!winner || result.value > winner.value) {
      winner = { candidate, matchedTerms: result.matchedTerms, value: result.value };
    }
  }
  if (!winner) return { kind: 'none', id: null, confidence: 0, matchedTerms: [] };
  return {
    kind: 'workflow',
    id: winner.candidate.id,
    confidence: Math.min(0.96, 0.58 + winner.value * 0.14),
    matchedTerms: winner.matchedTerms,
  };
};

export const resolveIntent = (input: string): IntentMatch => {
  const normalized = normalizeIntent(input);
  if (!normalized) return { kind: 'none', id: null, confidence: 0, matchedTerms: [] };

  const workflowMatch = resolveBest(normalized, WORKFLOW_REGISTRY);
  const toolCandidates = TOOL_RULES.map((rule) => ({ ...rule, intentPatterns: rule.terms }));
  const toolMatch = resolveBest(normalized, toolCandidates);

  if (workflowMatch.confidence >= 0.72 && workflowMatch.confidence >= toolMatch.confidence) return workflowMatch;
  if (toolMatch.confidence >= 0.72) return { ...toolMatch, kind: 'tool' };
  return { kind: 'none', id: null, confidence: Math.max(workflowMatch.confidence, toolMatch.confidence), matchedTerms: [...workflowMatch.matchedTerms, ...toolMatch.matchedTerms] };
};

export const getResolvedTool = (id: string) => TOOLS_REGISTRY.find((tool) => tool.id === id);
