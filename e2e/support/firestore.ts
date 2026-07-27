import { FIRESTORE_HOST, FUNCTIONS_BASE_URL, PROJECT_ID } from './constants';
import type { RepositoryFixture } from './fixtures';

// NOTE: the emulator-only wipe endpoint — same approach as
// functions/src/integration-specs/setup.ts. Removes every document so each
// test controls Firestore state before the client fetches on mount.
export async function clearRepositories(): Promise<void> {
  const response = await fetch(
    `http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to clear Firestore emulator (${response.status} ${response.statusText})`
    );
  }
}

// NOTE: seed via the real apiStoreRepoInfo endpoint (node-side fetch, no CORS)
// so the write path matches production instead of poking Firestore directly.
export async function seedRepositories(
  fixtures: RepositoryFixture[]
): Promise<void> {
  for (const fixture of fixtures) {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/apiStoreRepoInfo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fixture)
    });

    if (!response.ok) {
      throw new Error(
        `Failed to seed repository "${fixture.repoSlug}" (${response.status} ${response.statusText})`
      );
    }
  }
}
