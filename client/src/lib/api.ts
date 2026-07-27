import type { RepositoryWithId } from '../types/repository';

// NOTE: the backend functions are `onRequest` HTTP endpoints (not `onCall`), so they are
// reached via plain fetch. In dev, hit the local Functions emulator (port 5001); in prod,
// hit the deployed us-central1 URL. Mirrors the DEV/PROD switch in lib/firebase.ts.
const FUNCTIONS_BASE_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:5001/skillstack-724d8/us-central1'
  : 'https://us-central1-skillstack-724d8.cloudfunctions.net';

interface RepositoriesListResponse {
  repositories?: RepositoryWithId[];
}

export async function fetchRepositories(): Promise<RepositoryWithId[]> {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/apiGetRepositoriesList`);

  if (!response.ok) {
    throw new Error(`Failed to fetch repositories (${response.status})`);
  }

  const body = (await response.json()) as RepositoriesListResponse;

  return body.repositories ?? [];
}
