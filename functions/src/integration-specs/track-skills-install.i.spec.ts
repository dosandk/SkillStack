import admin from 'firebase-admin';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { BASE_URL } from './config';
import { db, clearFirestore } from './setup';

const REPO_SLUG = 'octocat/hello-world';

async function seedRepository() {
  const repoRef = await db.collection('repositories').add({
    repoSlug: REPO_SLUG,
    author: 'octocat',
    commitHash: 'a1b2c3d',
    totalInstalls: 2
  });

  await repoRef
    .collection('skills')
    .doc('frontend-design')
    .set({ installCount: 1 });
  await repoRef
    .collection('skills')
    .doc('code-review')
    .set({ installCount: 1 });

  return repoRef;
}

async function installCounts(repoRef: FirebaseFirestore.DocumentReference) {
  const skills = await repoRef.collection('skills').get();

  return Object.fromEntries(
    skills.docs.map(doc => [doc.id, doc.data().installCount])
  );
}

async function totalInstalls(repoRef: FirebaseFirestore.DocumentReference) {
  const snapshot = await repoRef.get();

  return snapshot.data()?.totalInstalls;
}

describe('apiTrackSkillsInstall', () => {
  beforeEach(clearFirestore);
  afterAll(() => admin.app().delete());

  it('should increment the listed skills', async () => {
    const repoRef = await seedRepository();

    const res = await fetch(`${BASE_URL}/apiTrackSkillsInstall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoSlug: REPO_SLUG,
        owner: 'octocat',
        defaultBranch: 'main',
        skills: ['frontend-design']
      })
    });

    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      repoId: repoRef.id,
      existedSkills: ['frontend-design'],
      missingSkills: []
    });
    expect(await installCounts(repoRef)).toEqual({
      'frontend-design': 2,
      'code-review': 1
    });
    expect(await totalInstalls(repoRef)).toBe(3);
  });

  it('should increment multiple listed skills', async () => {
    const repoRef = await seedRepository();

    const res = await fetch(`${BASE_URL}/apiTrackSkillsInstall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoSlug: REPO_SLUG,
        owner: 'octocat',
        defaultBranch: 'main',
        skills: ['frontend-design', 'code-review']
      })
    });

    expect(res.status).toBe(200);
    expect(await installCounts(repoRef)).toEqual({
      'frontend-design': 2,
      'code-review': 2
    });
    expect(await totalInstalls(repoRef)).toBe(4);
  });
});
