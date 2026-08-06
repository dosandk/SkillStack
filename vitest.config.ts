import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['shared/**/*.spec.ts', 'client/src/**/*.spec.tsx'],
    environment: 'node',
    fileParallelism: true,
    coverage: {
      provider: 'v8', // or 'istanbul'
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90
      }
    }
  }
});
