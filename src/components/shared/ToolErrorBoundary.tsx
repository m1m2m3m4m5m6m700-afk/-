import React from 'react';
import { getTraceId } from '@/lib/diagnostics/trace';
import { recordHydrationError } from '@/lib/diagnostics/runtime';

type Props = { children: React.ReactNode; label?: string };
type State = { error: Error | null };

export class ToolErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    recordHydrationError(error, info.componentStack ?? undefined);
    console.error('[flixo-tool-boundary]', {
      traceId: getTraceId(),
      label: this.props.label ?? 'tool',
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.error) return this.props.children;

    const traceId = getTraceId();
    return (
      <section role="alert" className="mx-auto max-w-2xl rounded-xl border p-6 text-center">
        <h2 className="text-xl font-semibold">This tool hit an unexpected error.</h2>
        <p className="mt-2 text-sm opacity-70">Trace ID: {traceId}</p>
        <button
          type="button"
          className="mt-4 rounded border px-4 py-2"
          onClick={() => this.setState({ error: null })}
        >
          Try again
        </button>
        {import.meta.env.DEV && (
          <pre className="mt-4 overflow-auto rounded bg-black/5 p-3 text-left text-xs">
            {this.state.error.stack ?? this.state.error.message}
          </pre>
        )}
      </section>
    );
  }
}
