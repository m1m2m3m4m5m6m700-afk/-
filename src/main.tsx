import React from 'react';
import ReactDOM from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';
import { installRuntimeDiagnostics } from './lib/diagnostics/runtime';
import './styles.css';
import './home.css';
import './quickflow.css';

installRuntimeDiagnostics();

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <StartClient />
  </React.StrictMode>,
);
