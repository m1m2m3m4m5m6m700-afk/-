import { createFileRoute } from '@tanstack/react-router';
import { EXECUTABLE_PIPELINE_TOOL_IDS } from '@/lib/workflows/executable-tools';
import { parseExecutionPlan } from '@/lib/contracts/ai-plan';

const PIPELINE_TOOL_IDS = [...EXECUTABLE_PIPELINE_TOOL_IDS];
const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    workflowName: { type: 'string' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    steps: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'object', properties: { toolId: { type: 'string', enum: PIPELINE_TOOL_IDS }, params: { type: 'object', additionalProperties: true } }, required: ['toolId'] } },
  },
  required: ['workflowName', 'confidence', 'steps'],
} as const;

const SYSTEM_PROMPT = `You are FLIXO's optional Intent Planner.\nUse ONLY these locally executable tools:\n${PIPELINE_TOOL_IDS.map((id) => `- ${id}`).join('\\n')}\nRules:\\n1. Return JSON matching the schema exactly.\\n2. Maximum 4 steps.\\n3. Never invent tools or cloud/AI execution steps.\\n4. Order transformations logically; compression/conversion should normally be last.\\n5. Keep parameters small, explicit, and relevant to the selected tool.\\n6. The browser executes the returned plan locally.`;

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_BUCKETS = 2048;
const rateBuckets = new Map<string, { startedAt: number; count: number }>();

function getClientKey(request: Request) {
  return request.headers.get('x-real-ip')?.trim() || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    if (rateBuckets.size > MAX_BUCKETS) for (const [entryKey, entry] of rateBuckets) if (now - entry.startedAt >= WINDOW_MS) rateBuckets.delete(entryKey);
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
    for (const part of content) if (part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string') return (part as Record<string, string>).text;
  }
  return '';
}

export const Route = createFileRoute('/api/ai/plan')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const traceId = request.headers.get('x-flixo-trace-id')?.trim() || crypto.randomUUID();
        const headers = { 'x-flixo-trace-id': traceId, 'Cache-Control': 'no-store' };
        const json = (body: unknown, status: number) => Response.json(body, { status, headers });
        const body = await request.json().catch(() => null) as { prompt?: unknown } | null;
        const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
        const maxChars = Number(process.env.FLIXO_AI_MAX_INPUT_CHARS || 1200);
        const inputLimit = Number.isFinite(maxChars) && maxChars > 0 ? Math.min(maxChars, 4000) : 1200;
        if (!prompt) return json({ error: 'prompt is required', traceId }, 400);
        if (prompt.length > inputLimit) return json({ error: `prompt exceeds the ${inputLimit}-character limit`, traceId }, 413);
        if (!consumeRateLimit(getClientKey(request))) return json({ error: 'AI planner rate limit exceeded', traceId }, 429);
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return json({ error: 'AI planner is not configured', traceId }, 503);

        try {
          console.info(JSON.stringify({ level: 'info', event: 'ai.plan.request', traceId, promptLength: prompt.length }));
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({ model: process.env.GEMINI_MODEL || 'gemini-3.7-flash', input: `${SYSTEM_PROMPT}\n\nUSER GOAL:\n${prompt}`, response_format: { type: 'text', mime_type: 'application/json', schema: PLAN_SCHEMA } }),
          });
          if (!response.ok) {
            console.error(JSON.stringify({ level: 'error', event: 'ai.plan.provider_error', traceId, status: response.status }));
            return json({ error: `AI provider error (${response.status})`, traceId }, 502);
          }
          const raw = readModelText(await response.json());
          if (!raw) return json({ error: 'AI provider returned no structured output', traceId }, 502);
          let parsed: unknown;
          try { parsed = JSON.parse(raw); } catch { return json({ error: 'AI provider returned invalid JSON', traceId }, 502); }
          try { return json({ ...parseExecutionPlan(parsed), traceId }, 200); }
          catch (error) {
            console.error(JSON.stringify({ level: 'error', event: 'ai.plan.contract_error', traceId, message: error instanceof Error ? error.message : String(error) }));
            return json({ error: 'AI provider returned a contract-invalid plan', traceId }, 502);
          }
        } catch (error) {
          console.error(JSON.stringify({ level: 'error', event: 'ai.plan.unhandled', traceId, message: error instanceof Error ? error.message : String(error) }));
          return json({ error: 'AI planner request failed', traceId }, 502);
        }
      },
    },
  },
});
