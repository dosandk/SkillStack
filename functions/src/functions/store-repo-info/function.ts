import {
  repositoriesStore,
  repositorySchema
} from '../../services/repositories-store';

export async function storeRepoInfo(input: unknown): Promise<string> {
  const data = repositorySchema.parse(input);
  const repo = await repositoriesStore.findByPath(data.repoSlug);

  if (repo) {
    return repo.id;
  }

  return repositoriesStore.add(data);
}
