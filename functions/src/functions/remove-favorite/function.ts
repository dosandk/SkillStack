import { z } from 'zod';

import { favoritesStore } from '../../services/favorites-store';
import { getFavorites, type FavoriteRepoEntry } from '../get-favorites/function';

const schema = z.object({
  repoId: z.string().min(1),
  skill: z.string().min(1).optional()
});

export async function removeFavorite(
  userId: string,
  input: unknown
): Promise<FavoriteRepoEntry[]> {
  const { repoId, skill } = schema.parse(input);

  await favoritesStore.removeFavorite(userId, repoId, skill);

  return getFavorites(userId);
}
