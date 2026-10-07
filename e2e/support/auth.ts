import { expect, type Page } from '@playwright/test';

import { AUTH_HOST, PROJECT_ID } from './constants';

// NOTE: emulator-only wipe endpoint — mirrors clearRepositories() in
// firestore.ts. Removes every mock account so each test controls sign-in state.
export async function clearAuthAccounts(): Promise<void> {
  const response = await fetch(
    `http://${AUTH_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to clear Auth emulator accounts (${response.status} ${response.statusText})`
    );
  }
}

interface MockGithubUser {
  sub: string;
  email: string;
  name: string;
}

const DEFAULT_MOCK_USER: MockGithubUser = {
  sub: 'e2e-user-1',
  email: 'e2e-user-1@example.com',
  name: 'E2E User'
};

// NOTE: bypasses signInWithPopup by driving Firebase's signInWithCredential via
// the dev-only window.__signInWithMockGithubCredential hook (see
// client/src/lib/firebase.ts). The popup handshake is racy under headless
// Chromium — window.opener.postMessage from the emulator popup is occasionally
// lost as the popup closes, so we cannot rely on it for deterministic tests.
export async function signInAsMockGithubUser(
  page: Page,
  overrides: Partial<MockGithubUser> = {}
): Promise<void> {
  const payload = { ...DEFAULT_MOCK_USER, ...overrides };

  await page.waitForFunction(
    () =>
      typeof (
        window as unknown as { __signInWithMockGithubCredential?: unknown }
      ).__signInWithMockGithubCredential === 'function'
  );

  await page.evaluate(async user => {
    const hook = (
      window as unknown as {
        __signInWithMockGithubCredential: (
          user: { sub: string; email: string; name: string }
        ) => Promise<void>;
      }
    ).__signInWithMockGithubCredential;

    await hook(user);
  }, payload);

  await expect(
    page.getByRole('banner').getByRole('button', { name: /sign out/i })
  ).toBeVisible();
}
