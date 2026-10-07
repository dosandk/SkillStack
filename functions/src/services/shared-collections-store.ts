import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';

export const SHARED_COLLECTIONS_COLLECTION = 'sharedCollections';

/** Snapshot of one favorited repo (or subset of its skills) at share time. */
export interface ShareEntry {
  repoId: string;
  repoSlug: string;
  owner: string;
  defaultBranch: string;
  skills: string[] | 'all';
}

export interface SharedCollectionDocument {
  ownerId: string;
  createdAt: Timestamp;
  entries: ShareEntry[];
}

export type SharedCollectionWithId = SharedCollectionDocument & {
  shareId: string;
};

const collection = () =>
  getFirestore().collection(SHARED_COLLECTIONS_COLLECTION);

export const sharedCollectionsStore = {
  // NOTE: write-once by design — shared collections are never updated or deleted
  // (see firestore.rules), so the store exposes no update/remove methods.
  async create(ownerId: string, entries: ShareEntry[]): Promise<string> {
    const ref = await collection().add({
      ownerId,
      entries,
      createdAt: FieldValue.serverTimestamp()
    });

    return ref.id;
  },

  async get(shareId: string): Promise<SharedCollectionWithId | null> {
    const snapshot = await collection().doc(shareId).get();

    if (!snapshot.exists) {
      return null;
    }

    return {
      shareId: snapshot.id,
      ...(snapshot.data() as SharedCollectionDocument)
    };
  }
};
