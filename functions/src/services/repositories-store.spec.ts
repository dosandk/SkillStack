import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

const { collection, collGet, add, doc, docGet, docDelete } = vi.hoisted(() => {
  const collGet = vi.fn();
  const add = vi.fn();
  const docGet = vi.fn();
  const docDelete = vi.fn();
  const doc = vi.fn(() => ({ get: docGet, delete: docDelete }));
  const collection = vi.fn(() => ({ get: collGet, add, doc }));

  return { collection, collGet, add, doc, docGet, docDelete };
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection })
}));

import {
  REPOSITORIES_COLLECTION,
  repositoriesStore
} from './repositories-store';

const validRepo = {
  repositoryPath: 'octocat/hello-world',
  author: 'octocat',
  commitHash: 'a1b2c3d'
};

describe('repositoriesStore', () => {
  beforeEach(() => {
    collection.mockClear();
    doc.mockClear();
    collGet.mockReset();
    add.mockReset();
    docGet.mockReset();
    docDelete.mockReset();
  });

  it('should return every document merged with its id when listing', async () => {
    collGet.mockResolvedValue({
      docs: [{ id: 'r1', data: () => validRepo }]
    });

    const result = await repositoriesStore.list();

    expect(result).toEqual([{ id: 'r1', ...validRepo }]);
    expect(collection).toHaveBeenCalledWith(REPOSITORIES_COLLECTION);
  });

  it('should return an empty array when listing an empty collection', async () => {
    collGet.mockResolvedValue({ docs: [] });

    await expect(repositoriesStore.list()).resolves.toEqual([]);
  });

  it('should return a document merged with its id when it exists', async () => {
    docGet.mockResolvedValue({
      exists: true,
      id: 'r1',
      data: () => validRepo
    });

    const result = await repositoriesStore.get('r1');

    expect(result).toEqual({ id: 'r1', ...validRepo });
    expect(doc).toHaveBeenCalledWith('r1');
  });

  it('should return null when getting a document that does not exist', async () => {
    docGet.mockResolvedValue({ exists: false });

    await expect(repositoriesStore.get('missing')).resolves.toBeNull();
  });

  it('should write a validated repository and return the document id', async () => {
    add.mockResolvedValue({ id: 'repo-123' });

    const id = await repositoriesStore.add(validRepo);

    expect(id).toBe('repo-123');
    expect(collection).toHaveBeenCalledWith(REPOSITORIES_COLLECTION);
    expect(add).toHaveBeenCalledWith(validRepo);
  });

  it('should reject invalid repository data without writing it', async () => {
    const invalidRepo = {
      repositoryPath: '',
      author: 'octocat',
      commitHash: 'a1b2c3d'
    };

    await expect(repositoriesStore.add(invalidRepo)).rejects.toThrow(ZodError);
    expect(add).not.toHaveBeenCalled();
  });

  it('should delete the document with the given id when removing', async () => {
    docDelete.mockResolvedValue(undefined);

    await repositoriesStore.remove('r1');

    expect(doc).toHaveBeenCalledWith('r1');
    expect(docDelete).toHaveBeenCalled();
  });
});
