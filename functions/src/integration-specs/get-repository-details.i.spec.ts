import admin from 'firebase-admin';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { BASE_URL } from './config';
import { db, clearFirestore } from './setup';

const REPO = {
  repoSlug: 'octocat/hello-world',
  owner: 'octocat',
  defaultBranch: 'main',
  skills: ['alpha', 'beta', 'gamma']
};

async function seedRepository() {
  const repoRef = await db.collection('repositories').add(REPO);
  const skills = repoRef.collection('skills');

  await skills.doc('alpha').set({ installCount: 5 });
  await skills.doc('beta').set({ installCount: 12 });
  await skills.doc('delta').set({ installCount: 5 });

  return repoRef;
}

function getDetails(query: string) {
  return fetch(`${BASE_URL}/apiGetRepositoryDetails${query}`);
}

describe('apiGetRepositoryDetails', () => {
  beforeEach(clearFirestore);
  afterAll(() => admin.app().delete());

  it('should return 200 with the repository and its skills sorted by install count', async () => {
    const repoRef = await seedRepository();

    const res = await getDetails(`?id=${repoRef.id}`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.repository).toEqual({ id: repoRef.id, ...REPO });
    expect(body.skills).toEqual([
      { name: 'beta', installCount: 12 },
      { name: 'alpha', installCount: 5 },
      { name: 'delta', installCount: 5 },
      { name: 'gamma', installCount: 0 }
    ]);
  });

  it('should return 404 for an unknown repository id', async () => {
    const res = await getDetails('?id=does-not-exist');
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({ error: 'Repository not found' });
  });

  it.each([
    ['missing', ''],
    ['empty', '?id='],
    ['containing a slash', `?id=${encodeURIComponent('a/b')}`]
  ])('should return 400 when the id is %s', async (_label, query) => {
    const res = await getDetails(query);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid repository id' });
  });

  it('should not change the stored data', async () => {
    const repoRef = await seedRepository();

    await getDetails(`?id=${repoRef.id}`);

    const skills = await repoRef.collection('skills').get();
    const counts = Object.fromEntries(
      skills.docs.map(doc => [doc.id, doc.data().installCount])
    );

    expect(counts).toEqual({ alpha: 5, beta: 12, delta: 5 });
  });
});
