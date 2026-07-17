import admin from 'firebase-admin';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { BASE_URL } from './config';
import { db, clearFirestore } from './setup';

describe('apiGetRepositoriesList (integration)', () => {
  beforeEach(clearFirestore);
  afterAll(() => admin.app().delete());

  it('should return an empty list when no repositories exist', async () => {
    const res = await fetch(`${BASE_URL}/apiGetRepositoriesList`);

    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.repositories).toEqual([]);
  });

  it('should return every persisted repository with its id', async () => {
    const repoA = {
      repositoryPath: 'octocat/hello-world',
      author: 'octocat',
      commitHash: 'a1b2c3d'
    };
    const repoB = {
      repositoryPath: 'dosandk/SkillStack',
      author: 'dosandk',
      commitHash: 'e4f5g6h'
    };
    const refA = await db.collection('repositories').add(repoA);
    const refB = await db.collection('repositories').add(repoB);

    const res = await fetch(`${BASE_URL}/apiGetRepositoriesList`);

    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.repositories).toHaveLength(2);
    expect(body.repositories).toEqual(
      expect.arrayContaining([
        { id: refA.id, ...repoA },
        { id: refB.id, ...repoB }
      ])
    );
  });
});
