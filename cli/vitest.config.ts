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
    environment: 'node'
  }
});
