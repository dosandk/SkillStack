import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BackendApiError, GithubApiError } from '@shared';

import { fetchRepositoryDetails, fetchSkillDescriptions } from './api';

const { getRepositoryDetails, getSkillDescriptions } = vi.hoisted(() => ({
  getRepositoryDetails: vi.fn(),
  getSkillDescriptions: vi.fn()
}));

vi.mock('@shared', async importOriginal => {
  const actual = await importOriginal<typeof import('@shared')>();

  return {
    ...actual,
    backendService: {
      getRepositoriesList: vi.fn(),
      getRepositoryDetails
    },
    githubService: { getSkillDescriptions }
  };
});

const repository = {
  id: 'r1',
  repoSlug: 'octocat/hello-world',
  owner: 'octocat',
  defaultBranch: 'main'
};

const backendError = (status: number) =>
  new BackendApiError(`Backend API GET ${status}`, { status });

describe('fetchRepositoryDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the details from the backend', async () => {
    const details = {
      repository,
      skills: [{ name: 'alpha', installCount: 3 }]
    };
    getRepositoryDetails.mockResolvedValue(details);

    await expect(fetchRepositoryDetails('r1')).resolves.toEqual(details);
    expect(getRepositoryDetails).toHaveBeenCalledWith('r1');
  });

  it('should return null when the backend answers 404', async () => {
    getRepositoryDetails.mockRejectedValue(backendError(404));

    await expect(fetchRepositoryDetails('missing')).resolves.toBeNull();
  });

  it('should return null when the backend answers 400', async () => {
    getRepositoryDetails.mockRejectedValue(backendError(400));

    await expect(fetchRepositoryDetails('a/b')).resolves.toBeNull();
  });

  it('should rethrow a backend error other than 400 or 404', async () => {
    const error = backendError(500);
    getRepositoryDetails.mockRejectedValue(error);

    await expect(fetchRepositoryDetails('r1')).rejects.toBe(error);
  });

  it('should rethrow an unexpected error', async () => {
    const error = new TypeError('boom');
    getRepositoryDetails.mockRejectedValue(error);

    await expect(fetchRepositoryDetails('r1')).rejects.toBe(error);
  });
});

describe('fetchSkillDescriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the descriptions loaded from GitHub', async () => {
    getSkillDescriptions.mockResolvedValue({ alpha: 'Does alpha things' });

    const result = await fetchSkillDescriptions(repository, ['alpha', 'beta']);

    expect(result).toEqual({ alpha: 'Does alpha things' });
    expect(getSkillDescriptions).toHaveBeenCalledWith({
      repoSlug: 'octocat/hello-world',
      defaultBranch: 'main',
      skillNames: ['alpha', 'beta']
    });
  });

  it('should resolve to no descriptions when GitHub rejects', async () => {
    getSkillDescriptions.mockRejectedValue(
      new GithubApiError('rate limited', { status: 403 })
    );

    await expect(
      fetchSkillDescriptions(repository, ['alpha'])
    ).resolves.toEqual({});
  });

  it('should resolve to no descriptions when an unexpected error is thrown', async () => {
    getSkillDescriptions.mockRejectedValue(new TypeError('boom'));

    await expect(
      fetchSkillDescriptions(repository, ['alpha'])
    ).resolves.toEqual({});
  });

  it('should resolve to no descriptions without calling GitHub when there are no skill names', async () => {
    await expect(fetchSkillDescriptions(repository, [])).resolves.toEqual({});

    expect(getSkillDescriptions).not.toHaveBeenCalled();
  });

  it('should resolve to no descriptions without calling GitHub when the default branch is missing', async () => {
    const withoutBranch = { ...repository, defaultBranch: '' };

    await expect(
      fetchSkillDescriptions(withoutBranch, ['alpha'])
    ).resolves.toEqual({});

    expect(getSkillDescriptions).not.toHaveBeenCalled();
  });
});
