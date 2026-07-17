import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.i.spec.ts'],
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 20000,
    // NOTE: integration specs share one Firestore emulator — run files serially so
    // each spec's clearFirestore/seed is not clobbered by another running in parallel
    fileParallelism: false
  }
});
