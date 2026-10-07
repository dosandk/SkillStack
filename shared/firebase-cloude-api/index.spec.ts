import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackendApiError, BackendService } from './index';

describe('BackendService', () => {
  const baseUrl = 'https://backend.test';
  let service: BackendService;

  beforeEach(() => {
    service = new BackendService(baseUrl);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should attach a Bearer token when an auth provider returns one', async () => {
    service.setAuthTokenProvider(async () => 'id-token-123');
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ favorites: [] })
    } as Response);

    await service.getFavorites();

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/apiGetFavorites`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer id-token-123'
        })
      })
    );
  });

  it('should omit Authorization when no auth provider is registered', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ shareId: 'abc', ownerId: 'u1', createdAt: '', entries: [] })
    } as Response);

    await service.getSharedCollection('share-1');

    const [, requestOptions] = vi.mocked(fetch).mock.calls[0];

    expect(requestOptions?.headers).not.toHaveProperty('Authorization');
  });

  it('should serialize query parameters on GET requests', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ shareId: 'share-1', ownerId: 'u1', createdAt: '', entries: [] })
    } as Response);

    await service.getSharedCollection('share-1');

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/apiGetSharedCollection?shareId=share-1`,
      expect.any(Object)
    );
  });

  it('should POST the repo id when adding a repository favorite', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ favorites: [] })
    } as Response);

    await service.addRepoFavorite('repo-1');

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/apiAddRepoFavorite`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ repoId: 'repo-1' })
      })
    );
  });

  it('should throw BackendApiError when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Missing token' })
    } as Response);

    const rejection = service.getFavorites();

    await expect(rejection).rejects.toThrow(BackendApiError);
    await expect(rejection).rejects.toThrow(/401 for apiGetFavorites/);
  });

  it('should wrap network failures in BackendApiError', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'));

    const rejection = service.createShareLink();

    await expect(rejection).rejects.toThrow(BackendApiError);
    await expect(rejection).rejects.toThrow(/apiCreateShareLink failed/);
  });
});
