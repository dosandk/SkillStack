import { useEffect, useState } from 'react';

import { fetchRepositories } from '../lib/api';
import type { RepositoryWithId } from '../types/repository';

interface UseRepositoriesResult {
  repositories: RepositoryWithId[];
  isLoading: boolean;
  error: Error | null;
}

export function useRepositories(): UseRepositoriesResult {
  const [repositories, setRepositories] = useState<RepositoryWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchRepositories()
      .then(result => {
        if (isActive) {
          setRepositories(result);
          setError(null);
        }
      })
      .catch((fetchError: unknown) => {
        if (isActive) {
          setError(
            fetchError instanceof Error
              ? fetchError
              : new Error('Failed to fetch repositories', { cause: fetchError })
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { repositories, isLoading, error };
}
