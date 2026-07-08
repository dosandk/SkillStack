import { cpSync } from 'node:fs';
import { defineConfig } from 'tsup';

const isDev = process.env.npm_lifecycle_event === 'dev';
const packageVersion = process.env.npm_package_version;

export default defineConfig({
  clean: true,
  entry: ['src/bin.ts', 'src/index.ts'],
  format: ['esm'],
  minify: !isDev,
  target: 'esnext',
  outDir: 'dist',
  outExtension: ({ format }) => ({
    js: '.js'
  }),
  // NOTE: temp commented
  onSuccess() {
    // cpSync('src/components-docs', 'dist/components-docs', { recursive: true });
    // cpSync('src/cli/assets', 'dist/assets', { recursive: true });
    // cpSync('readme.md', 'dist/readme.md');
    // cpSync('license', 'dist/license');

    console.log('✅ Public assets copied');
  },
  define: {
    'process.env.NPM_PACKAGE_VERSION': JSON.stringify(packageVersion)
  }
});
