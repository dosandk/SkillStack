// cli/vitest.config.ts
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  envDir: __dirname,
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/index.ts')
    }
  },
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90
      }
    }
  }
});
