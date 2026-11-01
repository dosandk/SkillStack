import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackendApiError, BackendService } from './index';

const fetchMock = vi.fn();

function respondWith(status: number, body: unknown, statusText = '') {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => body
  });
}

describe('BackendService.getRepositoryDetails', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should request apiGetRepositoryDetails with the URL-encoded id and return the body', async () => {
    const body = {
      repository: {
        id: 'a b/c',
        repoSlug: 'octocat/hello-world',
        owner: 'octocat',
        defaultBranch: 'main'
      },
      skills: [{ name: 'alpha', installCount: 3 }]
    };
    respondWith(200, body);
    const service = new BackendService('http://backend.test');

    const result = await service.getRepositoryDetails('a b/c');

    expect(result).toEqual(body);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend.test/apiGetRepositoryDetails?id=a%20b%2Fc',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should throw a BackendApiError with status 404 when the repository is not found', async () => {
    respondWith(404, { error: 'Repository not found' }, 'Not Found');
    const service = new BackendService('http://backend.test');

    const promise = service.getRepositoryDetails('missing');

    await expect(promise).rejects.toBeInstanceOf(BackendApiError);
    await expect(promise).rejects.toMatchObject({ status: 404 });
  });

  it('should throw a BackendApiError with status 400 for an invalid id', async () => {
    respondWith(400, { error: 'Invalid repository id' }, 'Bad Request');
    const service = new BackendService('http://backend.test');

    await expect(service.getRepositoryDetails('')).rejects.toMatchObject({
      name: 'BackendApiError',
      status: 400
    });
  });

  it('should throw a BackendApiError with status 500 when the backend fails', async () => {
    respondWith(
      500,
      { error: 'Failed to get repository details' },
      'Internal Server Error'
    );
    const service = new BackendService('http://backend.test');

    await expect(service.getRepositoryDetails('r1')).rejects.toMatchObject({
      name: 'BackendApiError',
      status: 500
    });
  });

  it('should throw a BackendApiError with status 0 when the network request fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const service = new BackendService('http://backend.test');

    await expect(service.getRepositoryDetails('r1')).rejects.toMatchObject({
      name: 'BackendApiError',
      status: 0
    });
  });
});
