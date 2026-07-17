import { beforeEach, describe, expect, it, vi } from 'vitest';

const { add, collection } = vi.hoisted(() => {
  const add = vi.fn();

  return { add, collection: vi.fn(() => ({ add })) };
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection })
}));

import { REPOSITORIES_COLLECTION, writeRepository } from './write-repository';

const validRepo = {
  repositoryPath: 'octocat/hello-world',
  author: 'octocat',
  commitHash: 'a1b2c3d'
};

describe('writeRepository', () => {
  beforeEach(() => {
    add.mockReset();
    collection.mockClear();
  });

  it('should write a validated repository and return the document id', async () => {
    add.mockResolvedValue({ id: 'repo-123' });

    const id = await writeRepository(validRepo);

    expect(id).toBe('repo-123');
    expect(collection).toHaveBeenCalledWith(REPOSITORIES_COLLECTION);
    expect(add).toHaveBeenCalledWith(validRepo);
  });
});
