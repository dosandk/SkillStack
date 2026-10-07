import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';

vi.mock('../../services/shared-collections-store', () => ({
  sharedCollectionsStore: { get: vi.fn() }
}));

import { sharedCollectionsStore } from '../../services/shared-collections-store';
import {
  getSharedCollection,
  SharedCollectionNotFoundError
} from './function';

describe('getSharedCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should serialize the shared collection for public consumption', async () => {
    const createdAt = Timestamp.fromDate(new Date('2026-01-01T00:00:00.000Z'));

    vi.mocked(sharedCollectionsStore.get).mockResolvedValue({
      shareId: 'share-1',
      ownerId: 'user-1',
      createdAt,
      entries: [
        {
          repoId: 'repo-1',
          repoSlug: 'octocat/hello-world',
          owner: 'octocat',
          defaultBranch: 'main',
          skills: 'all'
        }
      ]
    });

    const collection = await getSharedCollection('share-1');

    expect(collection).toEqual({
      shareId: 'share-1',
      ownerId: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      entries: [
        {
          repoId: 'repo-1',
          repoSlug: 'octocat/hello-world',
          owner: 'octocat',
          defaultBranch: 'main',
          skills: 'all'
        }
      ]
    });
  });

  it('should throw when the shared collection does not exist', async () => {
    vi.mocked(sharedCollectionsStore.get).mockResolvedValue(null);

    await expect(getSharedCollection('missing')).rejects.toThrow(
      SharedCollectionNotFoundError
    );
    await expect(getSharedCollection('missing')).rejects.toThrow(
      'Shared collection not found: missing'
    );
  });
});
