import admin from 'firebase-admin';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { BASE_URL } from './config';
import { db, clearFirestore } from './setup';

describe('apiWriteRepository (integration)', () => {
  beforeEach(clearFirestore);
  afterAll(() => admin.app().delete());

  it('should persist the repository and return its id over HTTP', async () => {
    const payload = {
      repositoryPath: 'octocat/hello-world',
      author: 'octocat',
      commitHash: 'a1b2c3d'
    };

    const res = await fetch(`${BASE_URL}/apiWriteRepository`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toEqual(expect.any(String));

    const snap = await db.collection('repositories').doc(body.id).get();

    expect(snap.exists).toBe(true);
    expect(snap.data()).toEqual(payload);
  });
});
