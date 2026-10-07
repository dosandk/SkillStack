import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/favorites-store', () => ({
  favoritesStore: { get: vi.fn() }
}));

vi.mock('../../services/repositories-store', () => ({
  repositoriesStore: { get: vi.fn() }
}));

import { favoritesStore } from '../../services/favorites-store';
import { repositoriesStore } from '../../services/repositories-store';
import { getFavorites } from './function';

describe('getFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enrich favorite entries with repository metadata', async () => {
    vi.mocked(favoritesStore.get).mockResolvedValue({
      userId: 'user-1',
      repos: {
        'repo-1': { all: true, skills: [] },
        'repo-2': { all: false, skills: ['testing'] }
      }
    });
    vi.mocked(repositoriesStore.get).mockImplementation(async repoId => {
      if (repoId === 'repo-1') {
        return {
          id: 'repo-1',
          repoSlug: 'octocat/alpha',
          defaultBranch: 'main',
          owner: 'octocat'
        };
      }

      return null;
    });

    const favorites = await getFavorites('user-1');

    expect(favorites).toEqual([
      {
        repoId: 'repo-1',
        repoSlug: 'octocat/alpha',
        owner: 'octocat',
        all: true,
        skills: []
      },
      {
        repoId: 'repo-2',
        repoSlug: 'repo-2',
        owner: '',
        all: false,
        skills: ['testing']
      }
    ]);
  });
});
