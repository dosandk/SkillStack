import {
  sharedCollectionsStore,
  type ShareEntry
} from '../../services/shared-collections-store';

export interface SharedCollectionResponse {
  shareId: string;
  ownerId: string;
  createdAt: string;
  entries: ShareEntry[];
}

export class SharedCollectionNotFoundError extends Error {
  constructor(shareId: string) {
    super(`Shared collection not found: ${shareId}`);
    this.name = 'SharedCollectionNotFoundError';
  }
}

export async function getSharedCollection(
  shareId: string
): Promise<SharedCollectionResponse> {
  const collection = await sharedCollectionsStore.get(shareId);

  if (!collection) {
    throw new SharedCollectionNotFoundError(shareId);
  }

  return {
    shareId: collection.shareId,
    ownerId: collection.ownerId,
    createdAt: collection.createdAt.toDate().toISOString(),
    entries: collection.entries
  };
}
