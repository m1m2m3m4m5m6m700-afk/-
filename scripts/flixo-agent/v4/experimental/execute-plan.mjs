import { verifyHypothesisSet } from '../core/verifier.mjs';

/** v4 executes only a verified v3 decision package. It never diagnoses or plans. */
export async function executePlan(decisionPackage, runner, options = {}) {
  const plan = decisionPackage?.plan;
  const verification = decisionPackage?.verification;
  if (!plan || plan.version !== 3 || plan.status !== 'planned') throw new Error('v4 requires a planned v3 repair plan');
  if (verification?.valid !== true) throw new Error('v4 requires a successful v3 verifier result');
  if (typeof runner?.createSandbox !== 'function' || typeof runner?.runCI !== 'function') throw new Error('v4 requires sandbox and CI runners');
  if (options.apply !== true) return { status: 'dry-run', executed: [], autoApply: false };

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

export function validateV3PlanForExecution(decisionPackage, hypothesisSet = []) {
  const plan = decisionPackage?.plan;
  const verification = decisionPackage?.verification;
  const hypotheses = Array.isArray(hypothesisSet) ? hypothesisSet : [];
  const hypothesisVerification = hypotheses.length ? verifyHypothesisSet(hypotheses, { apply: false }) : { valid: true, errors: [] };
  const errors = [];
  if (plan?.version !== 3) errors.push('only v3 plans are executable by v4');
  if (plan?.status !== 'planned') errors.push('v3 plan must be planned');
  if (verification?.valid !== true) errors.push('v3 verifier must pass before execution');
  if (plan?.policy?.autoApply) errors.push('v3 plan may not request autoApply');
  if (!hypothesisVerification.valid) errors.push(...hypothesisVerification.errors);
  return { valid: errors.length === 0, errors };
}
