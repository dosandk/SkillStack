import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';

export const REPOSITORIES_COLLECTION = 'repositories';

const repositorySchema = z.object({
  repositoryPath: z.string().min(1),
  author: z.string().min(1),
  commitHash: z.string().min(1)
});

export type Repository = z.infer<typeof repositorySchema>;

const db = getFirestore();

export async function writeRepository(input: unknown): Promise<string> {
  const repository = repositorySchema.parse(input);

  const ref = await db.collection(REPOSITORIES_COLLECTION).add(repository);

  return ref.id;
}
