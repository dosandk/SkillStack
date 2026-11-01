import {
  BackendApiError,
  backendService,
  githubService,
  type GetRepositoryDetailsResponse,
  type RepositoryWithId
} from '@shared';

export async function fetchRepositories(): Promise<RepositoryWithId[]> {
  const { repositories } = await backendService.getRepositoriesList();

  return repositories ?? [];
}

const NOT_FOUND_STATUSES = [400, 404];

/** Resolves to `null` when the repository does not exist (or its id is invalid). */
export async function fetchRepositoryDetails(
  id: string
): Promise<GetRepositoryDetailsResponse | null> {
  try {
    return await backendService.getRepositoryDetails(id);
  } catch (error) {
    if (
      error instanceof BackendApiError &&
      error.status !== undefined &&
      NOT_FOUND_STATUSES.includes(error.status)
    ) {
      return null;
    }

    throw error;
  }
}

/** Best effort: resolves to no descriptions on any failure, never rejects. */
export async function fetchSkillDescriptions(
  repository: RepositoryWithId,
  skillNames: string[]
): Promise<Record<string, string>> {
  if (skillNames.length === 0 || !repository.defaultBranch) {
    return {};
  }

  try {
    return await githubService.getSkillDescriptions({
      repoSlug: repository.repoSlug,
      defaultBranch: repository.defaultBranch,
      skillNames
    });
  } catch {
    return {};
  }
}
