import { beforeEach, describe, expect, it, vi } from 'vitest';

const { collection, rootAdd, docGet, docRef } = vi.hoisted(() => {
  const rootAdd = vi.fn();
  const docGet = vi.fn();
  const docRef = vi.fn(() => ({ get: docGet }));
  const collection = vi.fn(() => ({ add: rootAdd, doc: docRef }));

  return { collection, rootAdd, docGet, docRef };
});

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => ({ __serverTimestamp: true })) },
  getFirestore: () => ({ collection })
}));

import {
  SHARED_COLLECTIONS_COLLECTION,
  sharedCollectionsStore,
  type ShareEntry
} from './shared-collections-store';

const shareEntry: ShareEntry = {
  repoId: 'repo-1',
  repoSlug: 'octocat/hello-world',
  owner: 'octocat',
  defaultBranch: 'main',
  skills: 'all'
};

describe('sharedCollectionsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a shared collection document and return its id', async () => {
    rootAdd.mockResolvedValue({ id: 'share-123' });

    const shareId = await sharedCollectionsStore.create('user-1', [shareEntry]);

    expect(shareId).toBe('share-123');
    expect(collection).toHaveBeenCalledWith(SHARED_COLLECTIONS_COLLECTION);
    expect(rootAdd).toHaveBeenCalledWith({
      ownerId: 'user-1',
      entries: [shareEntry],
      createdAt: { __serverTimestamp: true }
    });
  });

  it('should return null when the shared collection does not exist', async () => {
    docGet.mockResolvedValue({ exists: false });

    await expect(sharedCollectionsStore.get('missing')).resolves.toBeNull();
    expect(docRef).toHaveBeenCalledWith('missing');
  });

  it('should return the shared collection merged with its id when it exists', async () => {
    const createdAt = { toDate: () => new Date('2026-01-01T00:00:00.000Z') };

    docGet.mockResolvedValue({
      exists: true,
      id: 'share-123',
      data: () => ({
        ownerId: 'user-1',
        createdAt,
        entries: [shareEntry]
      })
    });

    const collectionDocument = await sharedCollectionsStore.get('share-123');

    expect(collectionDocument).toEqual({
      shareId: 'share-123',
      ownerId: 'user-1',
      createdAt,
      entries: [shareEntry]
    });
  });
});
