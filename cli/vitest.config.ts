// cli/vitest.config.ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const cliDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(cliDir, '../shared/index.ts')
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
