// The shared TanStack Vite config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);

/**
 * FFmpeg's @ffmpeg/core single-threaded WASM is ~31 MiB raw, which exceeds
 * Cloudflare Workers' 25 MiB per-asset upload limit. Gzip brings it to ~9.8 MiB.
 *
 * This plugin intercepts the `@ffmpeg/core/wasm?url` import BEFORE Vite's
 * built-in asset plugin emits the raw `.wasm` (the project bundles with
 * Rolldown, which does not allow mutating the `bundle` in `generateBundle`, so
 * the asset must be handled upstream). It reads the raw WASM from
 * `node_modules/@ffmpeg/core`, gzip-compresses it, emits ONLY a `.wasm.gz`
 * asset via `this.emitFile`, and exports its served URL. The browser fetches
 * the `.gz` same-origin and decompresses it via `DecompressionStream` in
 * `getFfmpeg()` (src/lib/utils.ts) before handing the blob URL to
 * `ffmpeg.load`.
 *
 * No CSP/CDN/R2/dependency changes — the asset stays local and same-origin.
 */
function ffmpegWasmGzipPlugin(): Plugin {
  const VIRTUAL_ID = "\0flixo:ffmpeg-core-wasm-gz";
  return {
    name: "flixo:ffmpeg-wasm-gzip",
    apply: "build",
    enforce: "pre",
    resolveId(source) {
      if (source === "@ffmpeg/core/wasm?url") return VIRTUAL_ID;
    },
    load(id) {
      if (id !== VIRTUAL_ID) return;
      const wasmPath = require.resolve("@ffmpeg/core/wasm");
      const raw = readFileSync(wasmPath);
      const gz = gzipSync(raw, { level: 9 });
      const hash = createHash("sha1").update(gz).digest("hex").slice(0, 8);
      const fileName = `assets/ffmpeg-core-${hash}.wasm.gz`;
      const refId = this.emitFile({ type: "asset", fileName, source: gz });
      const url = `/${this.getFileName(refId)}`;
      return `export default ${JSON.stringify(url)};`;
    },
  };
}

// Minimal Nitro option surface for the lovable `defineConfig({ nitro })` type,
// which only types `preset`/`output`/`cloudflare`. `rolldownConfig` is passed
// through at runtime (lovable spreads the whole nitro object into nitro/vite),
// so we widen the type here and assign via a non-literal variable to keep
// `tsc --noEmit` green without a @ts-ignore.
type LovableNitroOptions = {
  preset?: string;
  output?: { dir?: string; publicDir?: string; serverDir?: string };
  cloudflare?: { nodeCompat?: boolean; deployConfig?: boolean };
  rolldownConfig?: {
    output?: Record<string, unknown>;
  };
};

// TanStack Start's `@tanstack/start-server-core` eagerly evaluates
// `defaultCsrfMiddleware = createCsrfMiddleware(...)` at module-init time,
// importing `createCsrfMiddleware` from `@tanstack/start-client-core`. The
// SSR pre-bundle (TanStack's Vite plugin) can split those two packages into
// separate chunks that import each other cyclically; under Node ESM
// depth-first evaluation the import runs before `createCsrfMiddleware`'s
// binding is initialized, throwing `TypeError: createCsrfMiddleware is not a
// function` and turning every SSR response into a 500 ("This page didn't
// load"). Grouping the framework-core SSR pre-bundles into one leaf chunk
// makes the eager call import `createCsrfMiddleware` from a chunk that fully
// evaluates first, breaking the cyclic TDZ. This only affects chunk grouping
// (no runtime/CSP/route/deploy behavior changes).
const nitroConfig: LovableNitroOptions = {
  preset: "vercel",
  rolldownConfig: {
    output: {
      codeSplitting: {
        groups: [
          {
            name: "_tanstack-start",
            test: /node_modules[\\/]\.nitro[\\/]vite[\\/]services[\\/]ssr[\\/](?:assets[\\/](?:createCsrfMiddleware-|createMiddleware-|_tanstack-start-manifest|start-)|index\.js$)/,
          },
        ],
      },
    },
  },
};

export default defineConfig({
  nitro: nitroConfig,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  plugins: [ffmpegWasmGzipPlugin()],
  vite: {
    server: {
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
      allowedHosts: true,
    },
  },
});
