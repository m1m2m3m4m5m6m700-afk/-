export type ToolTelemetry = {
  name: string;
  durationMs: number;
  ok: boolean;
  error?: string;
};

export type TelemetrySink = (event: ToolTelemetry) => void;

export const measureTool = async <T>(
  name: string,
  operation: () => Promise<T>,
  sink?: TelemetrySink,
): Promise<T> => {
  const started = Date.now();
  try {
    const result = await operation();
    sink?.({ name, durationMs: Date.now() - started, ok: true });
    return result;
  } catch (error) {
    sink?.({
      name,
      durationMs: Date.now() - started,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};
