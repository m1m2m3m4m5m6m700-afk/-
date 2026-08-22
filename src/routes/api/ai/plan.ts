import { createFileRoute } from '@tanstack/react-router';
import { TOOLS_REGISTRY } from '@/config/tools';

const MAX_STEPS = 4;
const PIPELINE_TOOL_IDS = TOOLS_REGISTRY
  .filter((tool) => tool.capabilities.local && tool.capabilities.blobIn && tool.capabilities.blobOut)
  .map((tool) => tool.id) as string[];
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
          toolId: { type: 'string', enum: PIPELINE_TOOL_IDS },
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
${PIPELINE_TOOL_IDS.map((id) => `- ${id}`).join('\n')}
Rules:
1. Return JSON only and follow the schema exactly.
2. Maximum 4 steps.
3. Never invent tool IDs or cloud/AI processing steps.
4. Order transformations logically; compression/conversion should normally be last.
5. Keep params small and explicit.
6. The browser executes the returned plan locally; do not assume the image is uploaded.`;

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const rateBuckets = new Map<string, { startedAt: number; count: number }>();

function getClientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) return false;
  bucket.count += 1;
  return true;
}

function readModelText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const root = payload as Record<string, unknown>;
  if (typeof root.output_text === 'string') return root.output_text;
  const steps = Array.isArray(root.steps) ? root.steps : [];
  for (const step of steps) {
    if (!step || typeof step !== 'object') continue;
    const item = step as Record<string, unknown>;
    if (item.type !== 'model_output') continue;
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string') return (part as Record<string, string>).text;
    }
  }
  return '';
}

function validatePlan(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Invalid AI plan.');
  const plan = value as Record<string, unknown>;
  if (typeof plan.workflowName !== 'string' || typeof plan.confidence !== 'number' || !Number.isFinite(plan.confidence) || !Array.isArray(plan.steps)) throw new Error('Invalid AI plan.');
  if (plan.confidence < 0 || plan.confidence > 1) throw new Error('AI confidence is out of range.');
  if (plan.steps.length < 1 || plan.steps.length > MAX_STEPS) throw new Error('AI plan exceeds the step limit.');
  for (const step of plan.steps) {
    if (!step || typeof step !== 'object') throw new Error('AI plan contains an invalid step.');
    const toolId = (step as Record<string, unknown>).toolId;
    if (typeof toolId !== 'string' || !PIPELINE_TOOL_IDS.includes(toolId)) throw new Error('AI plan contains a non-executable tool.');
    const params = (step as Record<string, unknown>).params;
    if (params !== undefined && (typeof params !== 'object' || params === null || Array.isArray(params))) throw new Error('AI plan contains invalid parameters.');
    if (params && typeof params === 'object') {
      for (const [key, param] of Object.entries(params as Record<string, unknown>)) {
        if (!['string', 'number', 'boolean'].includes(typeof param)) throw new Error(`Invalid parameter: ${key}`);
        if (typeof param === 'number' && !Number.isFinite(param)) throw new Error(`Invalid numeric parameter: ${key}`);
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
        const maxChars = Number(process.env.FLIXO_AI_MAX_INPUT_CHARS || 1200);
        const inputLimit = Number.isFinite(maxChars) && maxChars > 0 ? Math.min(maxChars, 4000) : 1200;
        if (!prompt) return Response.json({ error: 'prompt is required' }, { status: 400 });
        if (prompt.length > inputLimit) return Response.json({ error: `prompt exceeds the ${inputLimit}-character limit` }, { status: 413 });
        if (!consumeRateLimit(getClientKey(request))) return Response.json({ error: 'AI planner rate limit exceeded' }, { status: 429, headers: { 'Retry-After': '60' } });

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
        const raw = readModelText(payload);
        if (!raw) return Response.json({ error: 'AI provider returned no structured output' }, { status: 502 });
        let parsed: unknown;
        try { parsed = JSON.parse(raw); } catch { return Response.json({ error: 'AI provider returned invalid JSON' }, { status: 502 }); }
        const plan = validatePlan(parsed);
        return Response.json(plan, { headers: { 'Cache-Control': 'no-store' } });
      },
    },
  },
});
