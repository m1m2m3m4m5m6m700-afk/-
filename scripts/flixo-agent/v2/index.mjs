import { diagnose } from './core/diagnose.mjs';
import { collectContext } from './core/context.mjs';

/**
 * v2 observes and enriches detections with project context/history. It does
 * not create a repair plan, verify it, mutate files, or execute commands.
 */
export async function detectV2(log) {
  const context = await collectContext();
  return { version: '2.0.0', role: 'DETECT_CONTEXT', context, detection: diagnose(log) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(await detectV2(process.argv.slice(2).join(' ')), null, 2));
}
