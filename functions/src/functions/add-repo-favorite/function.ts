import { z } from 'zod';

import { favoritesStore } from '../../services/favorites-store';
import { getFavorites, type FavoriteRepoEntry } from '../get-favorites/function';

const schema = z.object({
  repoId: z.string().min(1)
});

export async function addRepoFavorite(
  userId: string,
  input: unknown
): Promise<FavoriteRepoEntry[]> {
  const { repoId } = schema.parse(input);

  await favoritesStore.addRepoFavorite(userId, repoId);

  return getFavorites(userId);
}
