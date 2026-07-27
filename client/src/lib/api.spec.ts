import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchRepositories } from './api';

describe('fetchRepositories', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the repositories from a successful response', async () => {
    const repositories = [
      {
        id: 'repo-1',
        repoSlug: 'octocat/hello-world',
        defaultBranch: 'main',
        owner: 'octocat',
        skills: ['a', 'b']
      }
    ];
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ repositories }) })
    );

    const result = await fetchRepositories();

    expect(result).toEqual(repositories);
  });

  it('should return an empty array when the response has no repositories field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    );

    const result = await fetchRepositories();

    expect(result).toEqual([]);
  });

  it('should throw with the status code when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    );

    await expect(fetchRepositories()).rejects.toThrow(
      'Failed to fetch repositories (500)'
    );
  });
});
