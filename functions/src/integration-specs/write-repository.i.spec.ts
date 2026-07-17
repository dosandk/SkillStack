import admin from 'firebase-admin';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { HOST, PROJECT_ID, BASE_URL } from './config';

admin.initializeApp({ projectId: PROJECT_ID });

const db = admin.firestore();

async function clearFirestore() {
  await fetch(
    `http://${HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );
}

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
