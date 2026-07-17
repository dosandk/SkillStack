import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.i.spec.ts'],
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 20000
  }
});
