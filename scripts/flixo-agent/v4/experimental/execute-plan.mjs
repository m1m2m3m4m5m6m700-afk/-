import { verifyHypothesisSet } from '../core/verifier.mjs';

/**
 * v4 is an executor only. The plan must originate from v3 and already be
 * verified. A runner is injected so unit/integration tests can use a fake
 * sandbox/CI without granting repository write access.
 */
export async function executePlan(plan, runner, options = {}) {
  if (!plan || plan.version !== 3 || plan.status !== 'planned') {
    throw new Error('v4 requires a planned v3 repair plan');
  }
  if (typeof runner?.createSandbox !== 'function' || typeof runner?.runCI !== 'function') {
    throw new Error('v4 requires sandbox and CI runners');
  }
  if (options.apply !== true) {
    return { status: 'dry-run', executed: [], autoApply: false };
  }

  const executed = [];
  for (const step of plan.steps ?? []) {
    const sandbox = await runner.createSandbox(step);
    try {
      await runner.applyStep(sandbox, step);
      const result = await runner.runCI(sandbox, step);
      executed.push({ id: step.id, result });
      if (result?.conclusion !== 'success') {
        await runner.rollback(sandbox, step);
        return { status: 'rolled-back', executed, failedStep: step.id, autoApply: true };
      }
      await runner.accept(sandbox, step);
    } catch (error) {
      await runner.rollback(sandbox, step);
      return { status: 'rolled-back', executed, failedStep: step.id, error: error instanceof Error ? error.message : String(error), autoApply: true };
    }
  }
  return { status: 'accepted', executed, autoApply: true };
}

export function validateV3PlanForExecution(plan, hypothesisSet = []) {
  const hypotheses = Array.isArray(hypothesisSet) ? hypothesisSet : [];
  const verification = hypotheses.length ? verifyHypothesisSet(hypotheses, { apply: false }) : { valid: true, errors: [] };
  const errors = [];
  if (plan?.version !== 3) errors.push('only v3 plans are executable by v4');
  if (plan?.status !== 'planned') errors.push('v3 plan must be planned');
  if (plan?.policy?.autoApply) errors.push('v3 plan may not request autoApply');
  if (!verification.valid) errors.push(...verification.errors);
  return { valid: errors.length === 0, errors };
}
