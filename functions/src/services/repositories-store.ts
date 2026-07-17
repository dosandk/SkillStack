import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';

export const REPOSITORIES_COLLECTION = 'repositories';

export const repositorySchema = z.object({
  repositoryPath: z.string().min(1),
  author: z.string().min(1),
  commitHash: z.string().min(1)
});

export type Repository = z.infer<typeof repositorySchema>;
export type RepositoryWithId = Repository & { id: string };

const collection = () => getFirestore().collection(REPOSITORIES_COLLECTION);

/**
 * Wrapper around the `repositories` Firestore collection.
 * Owns the collection name and document shape, and exposes read/write/delete access.
 */
export const repositoriesStore = {
  async list(): Promise<RepositoryWithId[]> {
    const snapshot = await collection().get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Repository)
    }));
  },

  async get(id: string): Promise<RepositoryWithId | null> {
    const snapshot = await collection().doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return { id: snapshot.id, ...(snapshot.data() as Repository) };
  },

  async add(input: unknown): Promise<string> {
    const repository = repositorySchema.parse(input);

    const ref = await collection().add(repository);

    return ref.id;
  },

  async remove(id: string): Promise<void> {
    await collection().doc(id).delete();
  }
};
