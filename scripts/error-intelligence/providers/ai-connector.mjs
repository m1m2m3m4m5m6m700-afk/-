export async function callConfiguredProvider(log, context = {}) {
  const provider = process.env.FLIXO_AI_PROVIDER;
  const endpoint = process.env.FLIXO_AI_ENDPOINT;
  if (!provider || !endpoint) return { enabled: false, reason: 'No AI provider configured.' };

  if (process.env.FLIXO_AI_ALLOW_EXTERNAL !== 'true') {
    return { enabled: false, reason: 'External AI providers are disabled by policy.' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ provider, log, context }),
  });
  if (!response.ok) throw new Error(`AI provider failed with HTTP ${response.status}`);
  return { enabled: true, provider, result: await response.json() };
}
