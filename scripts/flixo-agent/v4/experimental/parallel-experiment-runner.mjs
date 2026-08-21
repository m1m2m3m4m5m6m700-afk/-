const DEFAULT_MAX_CONCURRENCY = 2;
const MAX_EXPERIMENTS = 3;

function filesFor(experiment) {
  return new Set((experiment?.changes ?? []).map((change) => change.file).filter(Boolean));
}

function overlaps(a, b) {
  const af = filesFor(a);
  const bf = filesFor(b);
  return [...af].some((file) => bf.has(file));
}

export function validateParallelExperiments(experiments, { maxConcurrency = DEFAULT_MAX_CONCURRENCY } = {}) {
  const errors = [];
  if (!Array.isArray(experiments) || experiments.length === 0) errors.push('no experiments');
  if (experiments.length > MAX_EXPERIMENTS) errors.push('maximum 3 experiments exceeded');
  if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) errors.push('maxConcurrency must be >= 1');
  for (let i = 0; i < experiments.length; i += 1) {
    for (let j = i + 1; j < experiments.length; j += 1) {
      if (overlaps(experiments[i], experiments[j])) errors.push(`conflicting experiments: ${experiments[i].experimentId} and ${experiments[j].experimentId}`);
    }
  }
  return { valid: errors.length === 0, errors, maxConcurrency };
}

export async function runParallelExperiments(experiments, runner, options = {}) {
  const validation = validateParallelExperiments(experiments, options);
  if (!validation.valid) throw new Error(validation.errors.join('; '));
  if (typeof runner?.run !== 'function') throw new Error('parallel runner requires runner.run');

  const maxConcurrency = Math.min(validation.maxConcurrency, experiments.length);
  const queue = [...experiments];
  const results = [];
  const workers = Array.from({ length: maxConcurrency }, async () => {
    while (queue.length) {
      const experiment = queue.shift();
      const result = await runner.run(experiment);
      results.push({ experimentId: experiment.experimentId, tool: experiment.tool ?? null, result });
    }
  });
  await Promise.all(workers);

  const accepted = results.find((item) => item.result?.status === 'accepted' || item.result?.conclusion === 'success') ?? null;
  return { status: accepted ? 'accepted' : 'all-failed', results, acceptedExperimentId: accepted?.experimentId ?? null, maxConcurrency };
}
