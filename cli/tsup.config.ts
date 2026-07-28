import { cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const cliDir = path.dirname(fileURLToPath(import.meta.url));

// NOTE: read at build time — the `dev` script sets NODE_ENV via cross-env for the tsup
// process, so it is reliable here (unlike inside the emitted bundle, where it is unset).
const isDev = process.env.NODE_ENV === 'development';
const nodeEnv = process.env.NODE_ENV ?? 'production';
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
  external: ['dotenv'],
  esbuildOptions(options) {
    options.alias = {
      ...options.alias,
      '@shared': path.resolve(cliDir, '../shared/index.ts')
    };
  },
  // NOTE: temp commented
  onSuccess() {
    // cpSync('src/components-docs', 'dist/components-docs', { recursive: true });
    // cpSync('src/cli/assets', 'dist/assets', { recursive: true });
    // cpSync('readme.md', 'dist/readme.md');
    // cpSync('license', 'dist/license');

    console.log('✅ Public assets copied');
  },
  define: {
    'process.env.NPM_PACKAGE_VERSION': JSON.stringify(packageVersion),
    // NOTE: inline NODE_ENV into the bundle — esbuild does not substitute it otherwise, so
    // the runtime lookup would resolve to undefined when the built CLI is executed.
    'process.env.NODE_ENV': JSON.stringify(nodeEnv)
  }
});
