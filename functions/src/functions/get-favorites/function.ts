import { favoritesStore } from '../../services/favorites-store';
import { repositoriesStore } from '../../services/repositories-store';

export interface FavoriteRepoEntry {
  repoId: string;
  repoSlug: string;
  owner: string;
  all: boolean;
  skills: string[];
}

export async function getFavorites(userId: string): Promise<FavoriteRepoEntry[]> {
  const document = await favoritesStore.get(userId);

  return Promise.all(
    Object.entries(document.repos).map(async ([repoId, state]) => {
      const repository = await repositoriesStore.get(repoId);

      return {
        repoId,
        repoSlug: repository?.repoSlug ?? repoId,
        owner: repository?.owner ?? '',
        all: state.all,
        skills: state.skills
      };
    })
  );
}
