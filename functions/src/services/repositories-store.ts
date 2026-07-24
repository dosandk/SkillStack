import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';

export const REPOSITORIES_COLLECTION = 'repositories';
export const SKILLS_SUBCOLLECTION = 'skills';

export const repositorySchema = z.object({
  repoSlug: z.string().min(1),
  defaultBranch: z.string().min(1),
  owner: z.string().min(1),
  skills: z.array(z.string().min(1)).optional()
});

export type Repository = z.infer<typeof repositorySchema>;

/**
 * Persisted repository shape: the input fields plus the server-managed
 * `totalInstalls` aggregate (sum of every skill's `installCount`). Optional
 * because documents created before the counter existed may lack it.
 */
export type RepositoryDocument = Repository & { totalInstalls?: number };
export type RepositoryWithId = RepositoryDocument & { id: string };

/** A skill of a repository together with how many times it has been installed. */
export type SkillWithInstalls = { name: string; installCount: number };

const collection = () => getFirestore().collection(REPOSITORIES_COLLECTION);
const skillsCollection = (repoId: string) =>
  collection().doc(repoId).collection(SKILLS_SUBCOLLECTION);

export const repositoriesStore = {
  async list(): Promise<RepositoryWithId[]> {
    const snapshot = await collection().get();

    const result = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as RepositoryDocument)
    }));

    return result;
  },

  async get(id: string): Promise<RepositoryWithId | null> {
    const snapshot = await collection().doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return { id: snapshot.id, ...(snapshot.data() as RepositoryDocument) };
  },

  async findByPath(repoSlug: string): Promise<RepositoryWithId | null> {
    const snapshot = await collection()
      .where('repoSlug', '==', repoSlug)
      .limit(1)
      .get();

    const doc = snapshot.docs[0];

    if (!doc) {
      return null;
    }

    return { id: doc.id, ...(doc.data() as Repository) };
  },

  async add(input: unknown): Promise<string> {
    const repository = repositorySchema.parse(input);

    const ref = await collection().add(repository);

    return ref.id;
  },

  async remove(id: string): Promise<void> {
    await getFirestore().recursiveDelete(collection().doc(id));
  },

  async listSkillNames(repoId: string): Promise<string[]> {
    const snapshot = await skillsCollection(repoId).get();

    return snapshot.docs.map(doc => doc.id);
  },

  async hasSkill(repoId: string, skillName: string): Promise<boolean> {
    const snapshot = await skillsCollection(repoId).doc(skillName).get();

    return snapshot.exists;
  },

  // TODO: replace Promis<unknow> to some type according function return
  async recordInstalls(repoId: string, skillNames: string[]): Promise<unknown> {
    console.log('repoId', repoId);
    console.log('skillNames', skillNames);

    // TODO: need to validate existedSkills via github service
    if (skillNames.length === 0) {
      const skillNames = await this.listSkillNames(repoId);

      await this.updateSkillInstalls(repoId, skillNames);

      return {
        existedSkills: skillNames,
        missingSkills: []
      };
    }

    await this.updateSkillInstalls(repoId, skillNames);

    return {
      existedSkills: skillNames,
      missingSkills: []
    };
  },

  async updateSkillInstalls(
    repoId: string,
    skillNames: string[]
  ): Promise<void> {
    await Promise.all([
      ...skillNames.map(skillName =>
        skillsCollection(repoId)
          .doc(skillName)
          .set({ installCount: FieldValue.increment(1) }, { merge: true })
      ),
      collection()
        .doc(repoId)
        .set(
          { totalInstalls: FieldValue.increment(skillNames.length) },
          { merge: true }
        )
    ]);
  }
};
