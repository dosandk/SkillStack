import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

const { collection, repoDoc, repoDocGet, skillsCollGet } = vi.hoisted(() => {
  const skillsCollGet = vi.fn();
  const skillsColl = vi.fn(() => ({ get: skillsCollGet }));

  const repoDocGet = vi.fn();
  const repoDoc = vi.fn(() => ({ get: repoDocGet, collection: skillsColl }));

  const collection = vi.fn(() => ({ doc: repoDoc }));

  return { collection, repoDoc, repoDocGet, skillsCollGet };
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection }),
  FieldValue: { increment: vi.fn() }
}));

import { getRepositoryDetails } from './function';

const repository = {
  repoSlug: 'octocat/hello-world',
  defaultBranch: 'main',
  owner: 'octocat',
  skills: ['alpha', 'beta', 'gamma']
};

function givenRepository(
  skillsArray: string[] | undefined,
  skillDocs: Array<{ id: string; installCount?: number }>
) {
  repoDocGet.mockResolvedValue({
    exists: true,
    id: 'r1',
    data: () => ({ ...repository, skills: skillsArray })
  });
  skillsCollGet.mockResolvedValue({
    docs: skillDocs.map(({ id, installCount }) => ({
      id,
      data: () => (installCount === undefined ? {} : { installCount })
    }))
  });
}

describe('getRepositoryDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the repository with its skills and install counts', async () => {
    givenRepository(['alpha'], [{ id: 'alpha', installCount: 5 }]);

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result).toEqual({
      repository: { id: 'r1', ...repository, skills: ['alpha'] },
      skills: [{ name: 'alpha', installCount: 5 }]
    });
    expect(repoDoc).toHaveBeenCalledWith('r1');
  });

  it('should sort skills by install count, highest first', async () => {
    givenRepository(
      ['low', 'high', 'mid'],
      [
        { id: 'low', installCount: 1 },
        { id: 'high', installCount: 12 },
        { id: 'mid', installCount: 5 }
      ]
    );

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result?.skills.map(skill => skill.name)).toEqual([
      'high',
      'mid',
      'low'
    ]);
  });

  it('should order skills with equal install counts alphabetically by name', async () => {
    givenRepository(
      ['charlie', 'alpha', 'bravo'],
      [
        { id: 'charlie', installCount: 2 },
        { id: 'alpha', installCount: 2 },
        { id: 'bravo', installCount: 2 }
      ]
    );

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result?.skills.map(skill => skill.name)).toEqual([
      'alpha',
      'bravo',
      'charlie'
    ]);
  });

  it('should list a skill from the skills array with 0 installs when it has no skill document', async () => {
    givenRepository(['alpha', 'gamma'], [{ id: 'alpha', installCount: 3 }]);

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result?.skills).toEqual([
      { name: 'alpha', installCount: 3 },
      { name: 'gamma', installCount: 0 }
    ]);
  });

  it('should report 0 installs for a skill document without an installCount', async () => {
    givenRepository(['alpha'], [{ id: 'alpha' }]);

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result?.skills).toEqual([{ name: 'alpha', installCount: 0 }]);
  });

  it('should list a skill that exists only as a skill document', async () => {
    givenRepository(['alpha'], [{ id: 'delta', installCount: 4 }]);

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result?.skills).toEqual([
      { name: 'delta', installCount: 4 },
      { name: 'alpha', installCount: 0 }
    ]);
  });

  it('should list a skill once when it is in both the array and the subcollection', async () => {
    givenRepository(
      ['alpha', 'beta'],
      [
        { id: 'alpha', installCount: 5 },
        { id: 'beta', installCount: 12 }
      ]
    );

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result?.skills).toEqual([
      { name: 'beta', installCount: 12 },
      { name: 'alpha', installCount: 5 }
    ]);
  });

  it('should list the skill documents of a repository whose document has no skills array', async () => {
    givenRepository(undefined, [{ id: 'alpha', installCount: 1 }]);

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result?.skills).toEqual([{ name: 'alpha', installCount: 1 }]);
  });

  it('should return an empty skill list for a repository without skills', async () => {
    givenRepository([], []);

    const result = await getRepositoryDetails({ id: 'r1' });

    expect(result?.skills).toEqual([]);
  });

  it('should return null when the repository does not exist', async () => {
    repoDocGet.mockResolvedValue({ exists: false });
    skillsCollGet.mockResolvedValue({ docs: [] });

    await expect(getRepositoryDetails({ id: 'missing' })).resolves.toBeNull();
  });

  it.each([
    ['a missing id', {}],
    ['an empty id', { id: '' }],
    ['an id containing a slash', { id: 'a/b' }],
    ['a non-string id', { id: ['r1', 'r2'] }],
    ['no input', undefined]
  ])(
    'should reject %s without reading Firestore',
    async (_label, input: unknown) => {
      await expect(getRepositoryDetails(input)).rejects.toThrow(ZodError);

      expect(collection).not.toHaveBeenCalled();
    }
  );

  it('should propagate a store failure', async () => {
    repoDocGet.mockRejectedValue(new Error('firestore down'));
    skillsCollGet.mockResolvedValue({ docs: [] });

    await expect(getRepositoryDetails({ id: 'r1' })).rejects.toThrow(
      'firestore down'
    );
  });
});
