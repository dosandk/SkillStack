import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.{js,ts}'],
    exclude: [...configDefaults.exclude, 'src/**/*.i.spec.ts'],
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
