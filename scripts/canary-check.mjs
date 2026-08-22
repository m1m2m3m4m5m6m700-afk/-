const url = process.env.CANARY_URL?.replace(/\/$/, '');
if (!url) {
  console.error('CANARY_URL is required');
  process.exit(2);
}

const timeoutMs = Number(process.env.CANARY_TIMEOUT_MS || 10000);
const maxFailures = Number(process.env.CANARY_MAX_FAILURES || 0);

async function probe(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const started = performance.now();
    const response = await fetch(`${url}${path}`, { redirect: 'manual', signal: controller.signal, headers: { accept: 'text/html,application/json' } });
    return { path, status: response.status, durationMs: Math.round((performance.now() - started) * 100) / 100 };
  } finally {
    clearTimeout(timer);
  }
}

const results = await Promise.all([probe('/'), probe('/en/image-compressor'), probe('/ar/image-compressor')]);
const failures = results.filter((item) => item.status < 200 || item.status >= 400);
console.log(JSON.stringify({ event: 'canary.probe', url, results, failures: failures.length }));

if (failures.length > maxFailures) {
  console.error(`Canary failed: ${failures.length} failed probes`);
  process.exit(1);
}
