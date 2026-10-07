import { z } from 'zod';

import { favoritesStore } from '../../services/favorites-store';
import { repositoriesStore } from '../../services/repositories-store';
import {
  sharedCollectionsStore,
  type ShareEntry
} from '../../services/shared-collections-store';

const schema = z.object({
  repoIds: z.array(z.string().min(1)).optional()
});

export class NoFavoritesToShareError extends Error {
  constructor(userId: string) {
    super(`No favorites to share for user ${userId}`);
    this.name = 'NoFavoritesToShareError';
  }
}

export async function createShareLink(
  userId: string,
  input: unknown
): Promise<{ shareId: string }> {
  const { repoIds } = schema.parse(input);

  const document = await favoritesStore.get(userId);
  const selectedRepoIds = repoIds ?? Object.keys(document.repos);

  const entries: ShareEntry[] = [];

  for (const repoId of selectedRepoIds) {
    const state = document.repos[repoId];

    if (!state) {
      continue;
    }

    const repository = await repositoriesStore.get(repoId);

    if (!repository) {
      continue;
    }

    entries.push({
      repoId,
      repoSlug: repository.repoSlug,
      owner: repository.owner,
      defaultBranch: repository.defaultBranch,
      skills: state.all ? 'all' : state.skills
    });
  }

  if (entries.length === 0) {
    throw new NoFavoritesToShareError(userId);
  }

  const shareId = await sharedCollectionsStore.create(userId, entries);

  return { shareId };
}
