import { defineConfig, devices } from '@playwright/test';

import { APP_PORT, APP_URL } from './e2e/support/constants';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 30_000,

  // NOTE: e2e share one emulator instance and clear/seed Firestore between
  // cases, so they must run serially — never in parallel.
  fullyParallel: false,
  workers: 1,

  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry'
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // NOTE: spawn the Vite dev server (not `vite build`) so import.meta.env.DEV is
  // true and the client targets the local Functions emulator. `--strictPort`
  // makes Vite fail instead of silently falling back to another port.
  webServer: {
    command: `npm run dev:client -- --port ${APP_PORT} --strictPort`,
    url: APP_URL,
    reuseExistingServer: true,
    timeout: 30_000
  }
});
