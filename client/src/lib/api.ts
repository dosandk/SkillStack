import { backendService, type RepositoryWithId } from '@shared';

export async function fetchRepositories(): Promise<RepositoryWithId[]> {
  const { repositories } = await backendService.getRepositoriesList();

  return repositories ?? [];
}
