import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';

const allowedHosts = (process.env.VITE_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [
    tanstackStart({
      router: {
        virtualRouteConfig: './routes.ts',
      },
      // The virtual route tree is authoritative. Helper route-factory modules are not routes.
      routeFileIgnorePattern: '(^|\\/)(?:-virtual(?:\\/|$)|image-tools\\.tsx$|ar-image-tools\\.tsx$)',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts,
  },
});
