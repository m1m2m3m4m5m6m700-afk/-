import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vercel", ".vinxi", ".local", ".agents", ".cache"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // These rules flag intentional hydration and third-party widget
      // synchronization patterns used by the existing UI.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/routes/**/*.tsx"],
    rules: {
      // TanStack file routes export a route definition and a component from
      // the same module by design; Fast Refresh cannot interpret that shape.
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: [
      "src/components/ui/badge.tsx",
      "src/components/ui/button.tsx",
      "src/components/ui/form.tsx",
      "src/components/ui/navigation-menu.tsx",
      "src/components/ui/sidebar.tsx",
      "src/components/ui/toggle.tsx",
      "src/lib/analytics/AnalyticsProvider.tsx",
      "src/lib/i18n/index.tsx",
      "src/lib/theme.tsx",
    ],
    rules: {
      // These shared modules intentionally export hooks, contexts, and style
      // helpers alongside components; splitting them would make the public
      // component API less coherent without improving runtime refresh behavior.
      "react-refresh/only-export-components": "off",
    },
  },
  eslintPluginPrettier,
);
