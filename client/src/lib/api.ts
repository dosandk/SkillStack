import { backendService, type RepositoryWithId } from '@shared';

import type {
  FavoriteRepoEntry,
  SharedCollectionResponse
} from '../types/favorites';

export async function fetchRepositories(): Promise<RepositoryWithId[]> {
  const { repositories } = await backendService.getRepositoriesList();

  return repositories ?? [];
}

export async function fetchFavorites(): Promise<FavoriteRepoEntry[]> {
  const { favorites } = await backendService.getFavorites();

  return favorites ?? [];
}

export async function addRepoFavorite(
  repoId: string
): Promise<FavoriteRepoEntry[]> {
  const { favorites } = await backendService.addRepoFavorite(repoId);

  return favorites ?? [];
}

export async function addSkillFavorite(
  repoId: string,
  skill: string
): Promise<FavoriteRepoEntry[]> {
  const { favorites } = await backendService.addSkillFavorite(repoId, skill);

  return favorites ?? [];
}

export async function removeFavorite(
  repoId: string,
  skill?: string
): Promise<FavoriteRepoEntry[]> {
  const { favorites } = await backendService.removeFavorite(repoId, skill);

  return favorites ?? [];
}

export async function createShareLink(repoIds?: string[]): Promise<string> {
  const { shareId } = await backendService.createShareLink(repoIds);

  return shareId;
}

export async function fetchSharedCollection(
  shareId: string
): Promise<SharedCollectionResponse> {
  return backendService.getSharedCollection(shareId);
}
