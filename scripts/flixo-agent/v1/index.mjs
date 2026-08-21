import { diagnose } from './core/diagnose.mjs';

/**
 * v1 is observation-only. It may classify a log but must never plan, verify,
 * mutate files, create commits, or execute commands.
 */
export function detectV1(log) {
  return { version: '1.0.0', role: 'DETECT', detection: diagnose(log) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(detectV1(process.argv.slice(2).join(' ')), null, 2));
}
