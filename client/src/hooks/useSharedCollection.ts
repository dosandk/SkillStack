import { useEffect, useState } from 'react';

import { fetchSharedCollection } from '../lib/api';
import type { SharedCollectionResponse } from '../types/favorites';

interface UseSharedCollectionResult {
  collection: SharedCollectionResponse | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSharedCollection(
  shareId: string | undefined
): UseSharedCollectionResult {
  const [collection, setCollection] = useState<SharedCollectionResponse | null>(
    null
  );
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!shareId) {
      return;
    }

    fetchSharedCollection(shareId)
      .then(result => {
        if (isActive) {
          setCollection(result);
          setFetchError(null);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setFetchError(
            error instanceof Error
              ? error
              : new Error(`Failed to fetch shared collection ${shareId}`, {
                  cause: error
                })
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
  }, [shareId]);

  // NOTE: derived at render time (not via setState in the effect) — avoids
  // react-hooks/set-state-in-effect for the missing-shareId case.
  const isLoading = Boolean(shareId) && isFetching;
  const error = shareId ? fetchError : new Error('Missing share id');

  return { collection, isLoading, error };
}
