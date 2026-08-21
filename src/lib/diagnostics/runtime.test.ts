import { describe, expect, it } from 'vitest';

describe('runtime diagnostics contract', () => {
  it('exposes the storage contract without requiring a browser', async () => {
    const source = await import('./runtime');
    expect(source.getRuntimeDiagnostics).toBeTypeOf('function');
    expect(source.clearRuntimeDiagnostics).toBeTypeOf('function');
    expect(source.installRuntimeDiagnostics).toBeTypeOf('function');
  });
});
