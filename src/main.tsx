import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { getRouter } from './router';
import { installRuntimeDiagnostics } from './lib/diagnostics/runtime';
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
);
