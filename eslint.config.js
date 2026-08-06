import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import sonarjs from 'eslint-plugin-sonarjs';

export default defineConfig([
  globalIgnores(['dist', 'cli/coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      sonarjs.configs.recommended
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      // Allow intentionally-unused args/vars prefixed with `_`
      // (e.g. the 4-arg Express error handler needs `next` present).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  }
]);
