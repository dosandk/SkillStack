import { beforeEach, describe, expect, it, vi } from 'vitest';

const { collection, docGet, docSet, docRef } = vi.hoisted(() => {
  const docGet = vi.fn();
  const docSet = vi.fn();
  const docRef = vi.fn(() => ({ get: docGet, set: docSet }));
  const collection = vi.fn(() => ({ doc: docRef }));

  return { collection, docGet, docSet, docRef };
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection })
}));

import {
  FAVORITES_COLLECTION,
  favoritesStore
} from './favorites-store';

const userId = 'user-1';
const repoId = 'repo-1';

describe('favoritesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an empty document when the user has no favorites yet', async () => {
    docGet.mockResolvedValue({ exists: false });

    const document = await favoritesStore.get(userId);

    expect(document).toEqual({ userId, repos: {} });
    expect(collection).toHaveBeenCalledWith(FAVORITES_COLLECTION);
    expect(docRef).toHaveBeenCalledWith(userId);
  });

  it('should mark the entire repository as favorited when adding a repo favorite', async () => {
    docGet.mockResolvedValue({ exists: false });
    docSet.mockResolvedValue(undefined);

    const document = await favoritesStore.addRepoFavorite(userId, repoId);

    expect(document.repos[repoId]).toEqual({ all: true, skills: [] });
    expect(docSet).toHaveBeenCalledWith(document);
  });

  it('should accumulate skill favorites without changing an all-favorited repo', async () => {
    docGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        userId,
        repos: { [repoId]: { all: true, skills: [] } }
      })
    });

    const document = await favoritesStore.addSkillFavorite(
      userId,
      repoId,
      'linting'
    );

    expect(document.repos[repoId]).toEqual({ all: true, skills: [] });
    expect(docSet).not.toHaveBeenCalled();
  });

  it('should add a skill to a partially favorited repository', async () => {
    docGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        userId,
        repos: { [repoId]: { all: false, skills: ['testing'] } }
      })
    });
    docSet.mockResolvedValue(undefined);

    const document = await favoritesStore.addSkillFavorite(
      userId,
      repoId,
      'linting'
    );

    expect(document.repos[repoId]).toEqual({
      all: false,
      skills: ['testing', 'linting']
    });
    expect(docSet).toHaveBeenCalled();
  });

  it('should remove the entire repository favorite when no skill is specified', async () => {
    docGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        userId,
        repos: { [repoId]: { all: false, skills: ['testing'] } }
      })
    });
    docSet.mockResolvedValue(undefined);

    const document = await favoritesStore.removeFavorite(userId, repoId);

    expect(document.repos[repoId]).toBeUndefined();
    expect(docSet).toHaveBeenCalled();
  });

  it('should leave the document unchanged when removing a favorite for an unknown repository', async () => {
    docGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ userId, repos: {} })
    });

    const document = await favoritesStore.removeFavorite(userId, 'missing-repo');

    expect(document.repos).toEqual({});
    expect(docSet).not.toHaveBeenCalled();
  });

  it('should keep the repository entry when other skill favorites remain', async () => {
    docGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        userId,
        repos: { [repoId]: { all: false, skills: ['testing', 'linting'] } }
      })
    });
    docSet.mockResolvedValue(undefined);

    const document = await favoritesStore.removeFavorite(
      userId,
      repoId,
      'testing'
    );

    expect(document.repos[repoId]).toEqual({
      all: false,
      skills: ['linting']
    });
  });

  it('should drop the repository entry when the last skill favorite is removed', async () => {
    docGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        userId,
        repos: { [repoId]: { all: false, skills: ['testing'] } }
      })
    });
    docSet.mockResolvedValue(undefined);

    const document = await favoritesStore.removeFavorite(
      userId,
      repoId,
      'testing'
    );

    expect(document.repos[repoId]).toBeUndefined();
  });
});
