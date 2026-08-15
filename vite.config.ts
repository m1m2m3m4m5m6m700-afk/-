import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);

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
      return `export default ${JSON.stringify(`/${this.getFileName(refId)}`)};`;
    },
  };
}

type LovableNitroOptions = {
  preset?: string;
  output?: { dir?: string; publicDir?: string; serverDir?: string };
  cloudflare?: { nodeCompat?: boolean; deployConfig?: boolean };
  rolldownConfig?: { output?: Record<string, unknown> };
};

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
  tanstackStart: { server: { entry: "server" } },
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
