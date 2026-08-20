export type ToolDiagnosticSeverity = "info" | "warning" | "error";

export interface ToolDiagnostic {
  readonly severity: ToolDiagnosticSeverity;
  readonly code: string;
  readonly message: string;
  readonly toolId?: string;
  readonly route?: string;
  readonly stage?: string;
  readonly details?: Record<string, unknown>;
}

export interface ToolErrorEnvelope {
  readonly ok: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly retryable: boolean;
    readonly toolId?: string;
    readonly route?: string;
    readonly stage?: string;
  };
}

export function normalizeToolError(error: unknown): {
  message: string;
  name: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return { message: error.message, name: error.name, stack: error.stack };
  }

  if (typeof error === "string") {
    return { message: error, name: "Error" };
  }

  try {
    return { message: JSON.stringify(error), name: "UnknownError" };
  } catch {
    return { message: "Unknown tool error", name: "UnknownError" };
  }
}

export function createToolDiagnostic(
  severity: ToolDiagnosticSeverity,
  code: string,
  message: string,
  context: Omit<ToolDiagnostic, "severity" | "code" | "message"> = {},
): ToolDiagnostic {
  return Object.freeze({ severity, code, message, ...context });
}

export function createToolError(
  code: string,
  message: string,
  context: Omit<ToolErrorEnvelope["error"], "code" | "message"> = {},
): ToolErrorEnvelope {
  return Object.freeze({
    ok: false as const,
    error: Object.freeze({
      code,
      message,
      retryable: context.retryable ?? false,
      toolId: context.toolId,
      route: context.route,
      stage: context.stage,
    }),
  });
}

export function serializeDiagnostics(diagnostics: readonly ToolDiagnostic[]): string {
  return JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      summary: {
        errors: diagnostics.filter((entry) => entry.severity === "error").length,
        warnings: diagnostics.filter((entry) => entry.severity === "warning").length,
        info: diagnostics.filter((entry) => entry.severity === "info").length,
      },
      diagnostics,
    },
    null,
    2,
  );
}
