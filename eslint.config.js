import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import noIpRedirect from './eslint-rules/no-ip-redirect.mjs';

export default tseslint.config(
  { ignores: ['dist', 'playwright-report', 'test-results', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh, 'seo': { rules: { 'no-ip-redirect': noIpRedirect } } },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': 'warn',
      'seo/no-ip-redirect': 'error',
    },
  },
  {
    files: ['src/tools/image-compressor/index.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  prettier,
);
