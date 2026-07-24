import { z } from 'zod';

import { repositoriesStore } from '../../services/repositories-store';

const schema = z.object({
  repoSlug: z.string().min(1)
});

export async function deleteRepoInfo(input: unknown): Promise<void> {
  const data = schema.parse(input);

  const repository = await repositoriesStore.findByPath(data.repoSlug);

  if (!repository) {
    return;
  }

  await repositoriesStore.remove(repository.id);
}
