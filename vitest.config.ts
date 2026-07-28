import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['shared/**/*.spec.ts', 'client/src/**/*.spec.ts'],
    environment: 'node',
    fileParallelism: true
  }
});
