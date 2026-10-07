import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import {
  addRepoFavorite as addRepoFavoriteRequest,
  addSkillFavorite as addSkillFavoriteRequest,
  fetchFavorites,
  removeFavorite as removeFavoriteRequest
} from '../lib/api';
import type { FavoriteRepoEntry } from '../types/favorites';

interface UseFavoritesResult {
  favorites: FavoriteRepoEntry[];
  isLoading: boolean;
  error: Error | null;
  addRepoFavorite: (repoId: string) => Promise<void>;
  addSkillFavorite: (repoId: string, skill: string) => Promise<void>;
  removeFavorite: (repoId: string, skill?: string) => Promise<void>;
}

export function useFavorites(): UseFavoritesResult {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRepoEntry[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!user) {
      return;
    }

    fetchFavorites()
      .then(result => {
        if (isActive) {
          setFavorites(result);
          setFetchError(null);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setFetchError(
            error instanceof Error
              ? error
              : new Error('Failed to fetch favorites', { cause: error })
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsFetching(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  // NOTE: derived at render time (not via setState in the effect) so a signed-out
  // user never shows stale favorites or a stuck loading state — satisfies both
  // react-hooks/set-state-in-effect and the "never silently store anything" rule.
  const favoritesForCurrentUser = user ? favorites : [];
  const isLoading = Boolean(user) && isFetching;
  const error = user ? fetchError : null;

  const addRepoFavorite = useCallback(async (repoId: string) => {
    try {
      const result = await addRepoFavoriteRequest(repoId);
      setFavorites(result);
      setFetchError(null);
    } catch (mutationError: unknown) {
      console.error(`Failed to favorite repository ${repoId}:`, mutationError);
      setFetchError(
        mutationError instanceof Error
          ? mutationError
          : new Error(`Failed to favorite repository ${repoId}`, {
              cause: mutationError
            })
      );
    }
  }, []);

  const addSkillFavorite = useCallback(
    async (repoId: string, skill: string) => {
      try {
        const result = await addSkillFavoriteRequest(repoId, skill);
        setFavorites(result);
        setFetchError(null);
      } catch (mutationError: unknown) {
        console.error(
          `Failed to favorite skill ${skill} of repository ${repoId}:`,
          mutationError
        );
        setFetchError(
          mutationError instanceof Error
            ? mutationError
            : new Error(`Failed to favorite skill ${skill}`, {
                cause: mutationError
              })
        );
      }
    },
    []
  );

  const removeFavorite = useCallback(async (repoId: string, skill?: string) => {
    try {
      const result = await removeFavoriteRequest(repoId, skill);
      setFavorites(result);
      setFetchError(null);
    } catch (mutationError: unknown) {
      console.error(
        `Failed to remove favorite for repository ${repoId}:`,
        mutationError
      );
      setFetchError(
        mutationError instanceof Error
          ? mutationError
          : new Error(`Failed to remove favorite for repository ${repoId}`, {
              cause: mutationError
            })
      );
    }
  }, []);

  return {
    favorites: favoritesForCurrentUser,
    isLoading,
    error,
    addRepoFavorite,
    addSkillFavorite,
    removeFavorite
  };
}
