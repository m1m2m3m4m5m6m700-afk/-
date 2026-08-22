import { TOOLS_REGISTRY, type ToolConfig } from '@/config/tools';
import { resolveIntent } from '@/lib/intent/resolver';
import { getWorkflow } from '@/lib/workflows/registry';

export type ExecutionPlan = {
  workflowName: string;
  confidence: number;
  steps: Array<{
    toolId: ToolConfig['id'];
    params?: Record<string, string | number | boolean>;
  }>;
};

export const MAX_STEPS = 4;

export const PIPELINE_TOOL_IDS = new Set<string>(
  TOOLS_REGISTRY
    .filter((tool) => tool.capabilities.local && tool.capabilities.blobIn && tool.capabilities.blobOut)
    .map((tool) => tool.id),
);

function isExecutionPlan(value: unknown): value is ExecutionPlan {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Record<string, unknown>;
  if (typeof plan.workflowName !== 'string') return false;
  if (!Number.isFinite(plan.confidence) || typeof plan.confidence !== 'number' || plan.confidence < 0 || plan.confidence > 1) return false;
  if (!Array.isArray(plan.steps) || plan.steps.length === 0 || plan.steps.length > MAX_STEPS) return false;
  return plan.steps.every((step) => {
    if (!step || typeof step !== 'object') return false;
    const item = step as Record<string, unknown>;
    if (typeof item.toolId !== 'string' || !PIPELINE_TOOL_IDS.has(item.toolId)) return false;
    if (item.params !== undefined && (typeof item.params !== 'object' || item.params === null || Array.isArray(item.params))) return false;
    if (item.params && typeof item.params === 'object') {
      return Object.values(item.params as Record<string, unknown>).every((value) => ['string', 'number', 'boolean'].includes(typeof value) && (typeof value !== 'number' || Number.isFinite(value)));
    }
    return true;
  });
}

function presetParams(toolId: ToolConfig['id'], preset: Record<string, string> = {}) {
  if (toolId === 'background-remover' && preset.background) return { tolerance: preset.background === 'clean' ? 42 : 36 };
  if (toolId === 'image-cropper' && preset.aspectRatio) return { aspectRatio: preset.aspectRatio };
  if (toolId === 'image-compressor') return {
    ...(preset.targetSizeKB ? { targetSizeKB: Number(preset.targetSizeKB) } : {}),
    ...(preset.format ? { format: preset.format } : {}),
  };
  if (toolId === 'image-converter' && preset.format) return { format: preset.format };
  if (toolId === 'image-upscaler' && preset.scale) return { scale: Number(preset.scale) };
  return undefined;
}

export function planFromWorkflow(workflowId: string, preset: Record<string, string> = {}): ExecutionPlan | null {
  const workflow = getWorkflow(workflowId);
  if (!workflow) return null;
  const steps = workflow.steps.slice(0, MAX_STEPS).map((step) => ({
    toolId: step.toolId,
    params: { ...(step.params ?? {}), ...(presetParams(step.toolId, preset) ?? {}) },
  }));
  if (!steps.every((step) => PIPELINE_TOOL_IDS.has(step.toolId))) return null;
  return { workflowName: workflow.title, confidence: 0.99, steps };
}

function planFromIntent(input: string): ExecutionPlan | null {
  const intent = resolveIntent(input);
  if (intent.kind === 'workflow' && intent.id) return planFromWorkflow(intent.id);
  if (intent.kind === 'tool' && intent.id && PIPELINE_TOOL_IDS.has(intent.id)) {
    return { workflowName: 'Direct Tool', confidence: intent.confidence, steps: [{ toolId: intent.id }] };
  }
  return null;
}

export function validateExecutionPlan(plan: unknown): ExecutionPlan {
  if (!isExecutionPlan(plan)) throw new Error('FLIXO returned a plan containing an unsupported or non-executable tool.');
  return plan;
}

export async function generateExecutionPlan(userPrompt: string): Promise<ExecutionPlan> {
  const prompt = userPrompt.trim();
  const deterministic = planFromIntent(prompt);
  try {
    const response = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error('AI planner is unavailable.');
    return validateExecutionPlan(await response.json());
  } catch {
    if (deterministic) return deterministic;
    throw new Error('FLIXO could not determine a safe executable plan.');
  }
}
