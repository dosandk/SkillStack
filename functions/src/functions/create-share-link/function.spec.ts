import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/favorites-store', () => ({
  favoritesStore: { get: vi.fn() }
}));

vi.mock('../../services/repositories-store', () => ({
  repositoriesStore: { get: vi.fn() }
}));

vi.mock('../../services/shared-collections-store', () => ({
  sharedCollectionsStore: { create: vi.fn() }
}));

import { favoritesStore } from '../../services/favorites-store';
import { repositoriesStore } from '../../services/repositories-store';
import { sharedCollectionsStore } from '../../services/shared-collections-store';
import { createShareLink, NoFavoritesToShareError } from './function';

const repository = {
  id: 'repo-1',
  repoSlug: 'octocat/hello-world',
  defaultBranch: 'main',
  owner: 'octocat'
};

describe('createShareLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should snapshot every favorited repository when repoIds are omitted', async () => {
    vi.mocked(favoritesStore.get).mockResolvedValue({
      userId: 'user-1',
      repos: {
        'repo-1': { all: true, skills: [] },
        'repo-2': { all: false, skills: ['testing'] }
      }
    });
    vi.mocked(repositoriesStore.get).mockImplementation(async repoId => {
      if (repoId === 'repo-1') {
        return repository;
      }

      if (repoId === 'repo-2') {
        return {
          ...repository,
          id: 'repo-2',
          repoSlug: 'octocat/other'
        };
      }

      return null;
    });
    vi.mocked(sharedCollectionsStore.create).mockResolvedValue('share-123');

    const result = await createShareLink('user-1', {});

    expect(result).toEqual({ shareId: 'share-123' });
    expect(sharedCollectionsStore.create).toHaveBeenCalledWith('user-1', [
      {
        repoId: 'repo-1',
        repoSlug: 'octocat/hello-world',
        owner: 'octocat',
        defaultBranch: 'main',
        skills: 'all'
      },
      {
        repoId: 'repo-2',
        repoSlug: 'octocat/other',
        owner: 'octocat',
        defaultBranch: 'main',
        skills: ['testing']
      }
    ]);
  });

  it('should share only the requested repositories that still exist', async () => {
    vi.mocked(favoritesStore.get).mockResolvedValue({
      userId: 'user-1',
      repos: {
        'repo-1': { all: true, skills: [] },
        'repo-2': { all: false, skills: ['testing'] }
      }
    });
    vi.mocked(repositoriesStore.get).mockResolvedValue(repository);
    vi.mocked(sharedCollectionsStore.create).mockResolvedValue('share-456');

    await createShareLink('user-1', { repoIds: ['repo-1', 'missing-repo'] });

    expect(sharedCollectionsStore.create).toHaveBeenCalledWith('user-1', [
      expect.objectContaining({ repoId: 'repo-1', skills: 'all' })
    ]);
  });

  it('should skip favorited repositories that no longer exist in the catalog', async () => {
    vi.mocked(favoritesStore.get).mockResolvedValue({
      userId: 'user-1',
      repos: { 'repo-1': { all: true, skills: [] } }
    });
    vi.mocked(repositoriesStore.get).mockResolvedValue(null);
    vi.mocked(sharedCollectionsStore.create).mockResolvedValue('share-789');

    await expect(createShareLink('user-1', {})).rejects.toThrow(
      NoFavoritesToShareError
    );
    expect(sharedCollectionsStore.create).not.toHaveBeenCalled();
  });

  it('should reject when no favorited repositories can be shared', async () => {
    vi.mocked(favoritesStore.get).mockResolvedValue({
      userId: 'user-1',
      repos: {}
    });

    await expect(createShareLink('user-1', {})).rejects.toThrow(
      NoFavoritesToShareError
    );
    await expect(createShareLink('user-1', {})).rejects.toThrow(
      'No favorites to share for user user-1'
    );
  });
});
