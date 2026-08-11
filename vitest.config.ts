import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@eleks-ui/components': path.resolve(
        __dirname,
        'client/src/components/eleks-ui/components'
      ),
      '@eleks-ui/theme': path.resolve(
        __dirname,
        'client/src/components/eleks-ui/theme'
      )
    }
  },
  test: {
    fileParallelism: true,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90
      }
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'shared',
          include: ['shared/**/*.spec.ts'],
          environment: 'node'
        }
      },
      {
        extends: true,
        test: {
          name: 'client',
          include: ['client/src/**/*.spec.tsx'],
          environment: 'jsdom',
          setupFiles: ['client/src/test/setup.ts']
        }
      }
    ]
  }
});
