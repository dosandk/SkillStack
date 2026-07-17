import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.{js,ts}'],
    exclude: [...configDefaults.exclude, 'src/**/*.i.spec.ts'],
    environment: 'node'
  }
});
