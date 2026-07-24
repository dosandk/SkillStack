import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

const {
  collection,
  recursiveDelete,
  rootGet,
  rootAdd,
  where,
  limit,
  whereGet,
  repoDoc,
  repoDocGet,
  repoDocDelete,
  repoDocSet,
  skillsCollGet,
  skillDoc,
  skillDocGet,
  skillDocSet,
  increment
} = vi.hoisted(() => {
  const recursiveDelete = vi.fn();
  const rootGet = vi.fn();
  const rootAdd = vi.fn();
  const whereGet = vi.fn();
  const limit = vi.fn(() => ({ get: whereGet }));
  const where = vi.fn(() => ({ limit }));

  const skillDocGet = vi.fn();
  const skillDocSet = vi.fn();
  const skillDoc = vi.fn(() => ({ get: skillDocGet, set: skillDocSet }));
  const skillsCollGet = vi.fn();
  const skillsColl = vi.fn(() => ({ get: skillsCollGet, doc: skillDoc }));

  const repoDocGet = vi.fn();
  const repoDocDelete = vi.fn();
  const repoDocSet = vi.fn();
  const repoDoc = vi.fn(() => ({
    get: repoDocGet,
    delete: repoDocDelete,
    set: repoDocSet,
    collection: skillsColl
  }));

  const collection = vi.fn(() => ({
    get: rootGet,
    add: rootAdd,
    doc: repoDoc,
    where
  }));

  const increment = vi.fn((by: number) => ({ __increment: by }));

  return {
    collection,
    recursiveDelete,
    rootGet,
    rootAdd,
    where,
    limit,
    whereGet,
    repoDoc,
    repoDocGet,
    repoDocDelete,
    repoDocSet,
    skillsColl,
    skillsCollGet,
    skillDoc,
    skillDocGet,
    skillDocSet,
    increment
  };
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection, recursiveDelete }),
  FieldValue: { increment }
}));

import {
  REPOSITORIES_COLLECTION,
  repositoriesStore
} from './repositories-store';

const validRepo = {
  repoSlug: 'octocat/hello-world',
  defaultBranch: 'main',
  owner: 'octocat',
  skills: ['frontend-design']
};

describe('repositoriesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return every document merged with its id when listing', async () => {
    rootGet.mockResolvedValue({ docs: [{ id: 'r1', data: () => validRepo }] });

    const result = await repositoriesStore.list();

    expect(result).toEqual([{ id: 'r1', ...validRepo }]);
    expect(collection).toHaveBeenCalledWith(REPOSITORIES_COLLECTION);
  });

  it('should return an empty array when listing an empty collection', async () => {
    rootGet.mockResolvedValue({ docs: [] });

    await expect(repositoriesStore.list()).resolves.toEqual([]);
  });

  it('should return a document merged with its id when it exists', async () => {
    repoDocGet.mockResolvedValue({
      exists: true,
      id: 'r1',
      data: () => validRepo
    });

    const result = await repositoriesStore.get('r1');

    expect(result).toEqual({ id: 'r1', ...validRepo });
    expect(repoDoc).toHaveBeenCalledWith('r1');
  });

  it('should return null when getting a document that does not exist', async () => {
    repoDocGet.mockResolvedValue({ exists: false });

    await expect(repositoriesStore.get('missing')).resolves.toBeNull();
  });

  it('should return the first matching repository when finding by path', async () => {
    whereGet.mockResolvedValue({ docs: [{ id: 'r1', data: () => validRepo }] });

    const result = await repositoriesStore.findByPath(validRepo.repoSlug);

    expect(result).toEqual({ id: 'r1', ...validRepo });
    expect(where).toHaveBeenCalledWith('repoSlug', '==', validRepo.repoSlug);
    expect(limit).toHaveBeenCalledWith(1);
  });

  it('should return null when no repository matches the path', async () => {
    whereGet.mockResolvedValue({ docs: [] });

    await expect(
      repositoriesStore.findByPath('nobody/nothing')
    ).resolves.toBeNull();
  });

  it('should write a validated repository and return the document id', async () => {
    rootAdd.mockResolvedValue({ id: 'repo-123' });

    const id = await repositoriesStore.add(validRepo);

    expect(id).toBe('repo-123');
    expect(collection).toHaveBeenCalledWith(REPOSITORIES_COLLECTION);
    expect(rootAdd).toHaveBeenCalledWith(validRepo);
  });

  it('should reject invalid repository data without writing it', async () => {
    const invalidRepo = {
      repoSlug: '',
      author: 'octocat',
      commitHash: 'a1b2c3d'
    };

    await expect(repositoriesStore.add(invalidRepo)).rejects.toThrow(ZodError);
    expect(rootAdd).not.toHaveBeenCalled();
  });

  it('should delete the document with the given id when removing', async () => {
    recursiveDelete.mockResolvedValue(undefined);

    await repositoriesStore.remove('r1');

    expect(repoDoc).toHaveBeenCalledWith('r1');
    expect(recursiveDelete).toHaveBeenCalled();
  });

  it('should list the names of every skill of a repository', async () => {
    skillsCollGet.mockResolvedValue({ docs: [{ id: 'a' }, { id: 'b' }] });

    await expect(repositoriesStore.listSkillNames('r1')).resolves.toEqual([
      'a',
      'b'
    ]);
  });

  it('should report whether a skill exists', async () => {
    skillDocGet.mockResolvedValue({ exists: true });

    await expect(repositoriesStore.hasSkill('r1', 'a')).resolves.toBe(true);
    expect(skillDoc).toHaveBeenCalledWith('a');
  });

  it('should bump each skill counter by one and add the skill count to totalInstalls', async () => {
    skillDocSet.mockResolvedValue(undefined);
    repoDocSet.mockResolvedValue(undefined);

    await repositoriesStore.recordInstalls('r1', ['a', 'b']);

    expect(skillDoc).toHaveBeenCalledWith('a');
    expect(skillDoc).toHaveBeenCalledWith('b');
    expect(skillDocSet).toHaveBeenCalledWith(
      { installCount: { __increment: 1 } },
      { merge: true }
    );
    expect(skillDocSet).toHaveBeenCalledTimes(2);

    expect(repoDoc).toHaveBeenCalledWith('r1');
    expect(repoDocSet).toHaveBeenCalledWith(
      { totalInstalls: { __increment: 2 } },
      { merge: true }
    );
  });
});
