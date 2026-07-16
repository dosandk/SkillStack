import path from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // The React app lives in client/; everything below is resolved from repo root.
  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@eleks-ui/components': path.resolve(
        __dirname,
        'client/src/components/eleks-ui/components'
      ),
      '@eleks-ui/theme': path.resolve(
        __dirname,
        'client/src/components/eleks-ui/theme'
      )
    }
  }
});
