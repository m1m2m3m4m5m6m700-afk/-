import { createFileRoute } from '@tanstack/react-router';

const PIPELINE_TOOL_IDS = [
  'background-remover', 'image-upscaler', 'image-cropper', 'image-compressor',
  'image-converter', 'image-effects',
] as const;

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    workflowName: { type: 'string' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    steps: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          toolId: { type: 'string', enum: [...PIPELINE_TOOL_IDS] },
          params: { type: 'object', additionalProperties: true },
        },
        required: ['toolId'],
      },
    },
  },
  required: ['workflowName', 'confidence', 'steps'],
} as const;

const SYSTEM_PROMPT = `You are FLIXO's optional Intent Planner. The core product is deterministic local image processing.
Convert the user's image goal into a short execution chain using ONLY these currently executable local pipeline tools:
- background-remover: remove a simple image background
- image-upscaler: increase resolution; params scale 0.25..4
- image-cropper: center crop; params aspectRatio such as 1:1, 4:5, 16:9
- image-compressor: reduce file size; params quality 0.05..1, format image/webp|image/jpeg|image/png, targetSizeKB positive
- image-converter: change format; params format image/webp|image/jpeg|image/png
- image-effects: browser adjustments; params brightness, contrast, saturate, grayscale as percentages
Rules:
1. Return JSON only and follow the schema exactly.
2. Maximum 4 steps.
3. Never invent tool IDs or cloud/AI processing steps.
4. Order transformations logically; compression/conversion should normally be last.
5. Keep params small and explicit.
6. The browser executes the returned plan locally; do not assume the image is uploaded.`;

function extractJson(payload: unknown): unknown {
  const root = payload as Record<string, unknown>;
  const output = Array.isArray(root.output) ? root.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string') {
        try { return JSON.parse((part as Record<string, string>).text); } catch { return null; }
      }
    }
  }
  return null;
}

function validatePlan(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Invalid AI plan.');
  const plan = value as Record<string, unknown>;
  if (typeof plan.workflowName !== 'string' || typeof plan.confidence !== 'number' || !Array.isArray(plan.steps)) throw new Error('Invalid AI plan.');
  if (plan.steps.length < 1 || plan.steps.length > 4) throw new Error('AI plan exceeds the step limit.');
  for (const step of plan.steps) {
    if (!step || typeof step !== 'object') throw new Error('AI plan contains an invalid step.');
    const toolId = (step as Record<string, unknown>).toolId;
    if (typeof toolId !== 'string' || !PIPELINE_TOOL_IDS.includes(toolId as typeof PIPELINE_TOOL_IDS[number])) throw new Error('AI plan contains a non-executable tool.');
    const params = (step as Record<string, unknown>).params;
    if (params !== undefined && (typeof params !== 'object' || params === null)) throw new Error('AI plan contains invalid parameters.');
    if (params && typeof params === 'object') {
      for (const [key, param] of Object.entries(params as Record<string, unknown>)) {
        if (!['string', 'number', 'boolean'].includes(typeof param)) throw new Error(`Invalid parameter: ${key}`);
      }
    }
  }
  return plan;
}

export const Route = createFileRoute('/api/ai/plan')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null) as { prompt?: unknown } | null;
        const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
        if (!prompt) return Response.json({ error: 'prompt is required' }, { status: 400 });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return Response.json({ error: 'AI planner is not configured' }, { status: 503 });

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
            input: `${SYSTEM_PROMPT}\n\nUSER GOAL:\n${prompt}`,
            response_format: { type: 'text', mime_type: 'application/json', schema: PLAN_SCHEMA },
          }),
        });

        if (!response.ok) return Response.json({ error: `AI provider error (${response.status})` }, { status: 502 });
        const payload = await response.json();
        const plan = validatePlan(extractJson(payload));
        return Response.json(plan, { headers: { 'Cache-Control': 'no-store' } });
      },
    },
  },
});
