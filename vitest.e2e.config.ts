import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['e2e/**/*.e2e.ts'],
    environment: 'node',
    globalSetup: './e2e/support/global-setup.ts',
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
