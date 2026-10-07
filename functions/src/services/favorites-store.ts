import { getFirestore } from 'firebase-admin/firestore';

export const FAVORITES_COLLECTION = 'favorites';

export interface FavoriteRepoState {
  all: boolean;
  skills: string[];
}

export interface FavoritesDocument {
  userId: string;
  repos: Record<string, FavoriteRepoState>;
}

const collection = () => getFirestore().collection(FAVORITES_COLLECTION);

function emptyDocument(userId: string): FavoritesDocument {
  return { userId, repos: {} };
}

export const favoritesStore = {
  async get(userId: string): Promise<FavoritesDocument> {
    const snapshot = await collection().doc(userId).get();

    if (!snapshot.exists) {
      return emptyDocument(userId);
    }

    return snapshot.data() as FavoritesDocument;
  },

  async addRepoFavorite(
    userId: string,
    repoId: string
  ): Promise<FavoritesDocument> {
    const document = await this.get(userId);

    document.repos[repoId] = { all: true, skills: [] };

    await this.save(document);

    return document;
  },

  async addSkillFavorite(
    userId: string,
    repoId: string,
    skill: string
  ): Promise<FavoritesDocument> {
    const document = await this.get(userId);
    const repoState = document.repos[repoId];

    // NOTE: a fully-favorited repo already implies every skill — nothing to add.
    if (repoState?.all) {
      return document;
    }

    const skills = new Set(repoState?.skills ?? []);
    skills.add(skill);

    document.repos[repoId] = { all: false, skills: Array.from(skills) };

    await this.save(document);

    return document;
  },

  async removeFavorite(
    userId: string,
    repoId: string,
    skill?: string
  ): Promise<FavoritesDocument> {
    const document = await this.get(userId);
    const repoState = document.repos[repoId];

    if (!repoState) {
      return document;
    }

    if (!skill) {
      delete document.repos[repoId];

      await this.save(document);

      return document;
    }

    const skills = repoState.skills.filter(existing => existing !== skill);

    if (skills.length === 0 && !repoState.all) {
      delete document.repos[repoId];
    } else {
      document.repos[repoId] = { all: repoState.all, skills };
    }

    await this.save(document);

    return document;
  },

  async save(document: FavoritesDocument): Promise<void> {
    await collection().doc(document.userId).set(document);
  }
};
