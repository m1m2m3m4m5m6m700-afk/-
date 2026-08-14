# Flixo

Flixo is a TanStack Start workspace for browser-based utility and AI tools. The
landing page maps user requests to the canonical tool registry, and the
translator is the first working tool.

## Stack

- TanStack Start and TanStack Router
- React and TypeScript
- Vite, Tailwind CSS, and shadcn-style UI components
- Node.js server output with SSR error handling and security headers

## Development

Use Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

The development server listens on port 5000.

## Verification

```sh
npm run verify
```

This runs the strict TypeScript check, project lint, production build, and the
production dependency audit. The translator calls a server-side AI provider
chain (OpenAI/Gemini) via the `generate` RPC; when no provider is configured it
surfaces a clear error and never returns a fake translation.

## Project structure

- `src/data` — canonical categories, tools, and SEO data
- `src/components` — reusable layout, landing, tool, and UI components
- `src/routes` — TanStack file-based routes
- `src/lib` — typed utilities, analytics, localization, and tool logic
- `public` — static metadata, service-worker, and pre-paint initialization assets
