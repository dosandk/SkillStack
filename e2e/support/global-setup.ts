import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_PORT, APP_URL } from './constants';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VITE_BIN = path.resolve(REPO_ROOT, 'node_modules/.bin/vite');
const READY_TIMEOUT_MS = 30000;
const POLL_INTERVAL_MS = 500;

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // NOTE: connection refused until Vite binds the port — keep polling.
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Vite dev server did not become ready at ${url} within ${timeoutMs}ms`);
}

export default async function setup(): Promise<() => Promise<void>> {
  // NOTE: spawn the Vite dev server (not `vite build`) so import.meta.env.DEV is
  // true and the client targets the local Functions emulator. `--strictPort`
  // makes Vite fail instead of silently falling back to another port, so tests
  // can never run against a foreign server already holding 5173.
  const viteProcess: ChildProcess = spawn(
    VITE_BIN,
    ['--port', String(APP_PORT), '--strictPort'],
    {
      cwd: REPO_ROOT,
      stdio: 'inherit'
    }
  );

  viteProcess.on('error', error => {
    console.error('Failed to start Vite dev server:', error);
  });

  await waitForServer(APP_URL, READY_TIMEOUT_MS);

  return async () => {
    viteProcess.kill('SIGTERM');
  };
}
