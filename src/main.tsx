import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { getRouter } from './router';
import { installRuntimeDiagnostics, recordHydrationError } from './lib/diagnostics/runtime';
import { getTraceId } from './lib/diagnostics/trace';
import './styles.css';
import './home.css';
import './quickflow.css';

installRuntimeDiagnostics();

const router = getRouter();

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  {
    onRecoverableError(error, errorInfo) {
      recordHydrationError(error, errorInfo.componentStack ?? undefined);
      console.error('[flixo-hydration]', { traceId: getTraceId(), error, componentStack: errorInfo.componentStack });
    },
  },
);
