import { BACKEND_URL } from './config';
import { getRepoSlug } from '../utils';

// NOTE: mirrors the backend response shape (functions/src/services/repositories-store.ts
// RepositoryWithId). Fields other than `id` are optional because stored documents may be
// incomplete.
export interface RepositoryWithId {
  id: string;
  repoSlug: string;
  defaultBranch: string;
  owner: string;
  skills?: string[];
  totalInstalls?: number;
}

interface StoreRepoInfo {
  id: string;
  skills: string[];
}

interface StoreRepoInfoPayload {
  owner: string;
  repoSlug: string;
  defaultBranch: string;
  skills?: string[];
}

type GetRepositoriesListResponse = { repositories: RepositoryWithId[] };

type TrackSkillsInstallPayload = {
  owner: string;
  repoSlug: string;
  defaultBranch: string;
  skills?: string[];
};

type TrackSkillsInstallResponse = {
  repoId: string;
  existedSkills: string[];
  missingSkills: string[];
};

// NOTE: mirrors functions/src/services/favorites-store.ts FavoriteRepoState, enriched
// server-side with repoSlug/owner so clients don't need a second round trip.
export interface FavoriteRepoEntry {
  repoId: string;
  repoSlug: string;
  owner: string;
  all: boolean;
  skills: string[];
}

type GetFavoritesResponse = { favorites: FavoriteRepoEntry[] };

type CreateShareLinkResponse = { shareId: string };

// NOTE: mirrors functions/src/services/shared-collections-store.ts ShareEntry —
// `skills: 'all'` means every skill of that repo was favorited at share time.
export interface SharedCollectionEntry {
  repoId: string;
  repoSlug: string;
  owner: string;
  defaultBranch: string;
  skills: string[] | 'all';
}

export interface SharedCollectionResponse {
  shareId: string;
  ownerId: string;
  createdAt: string;
  entries: SharedCollectionEntry[];
}

type AuthTokenProvider = () => Promise<string | null>;

export class BackendApiError extends Error {
  readonly status?: number;
  readonly url?: string;
  readonly method?: string;

  constructor(
    message: string,
    context: {
      status?: number;
      method?: string;
      url?: string;
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: context.cause });
    this.name = 'BackendApiError';
    this.status = context.status;
    this.method = context.method;
    this.url = context.url;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export class BackendService {
  private readonly baseUrl: string | undefined;
  private authTokenProvider: AuthTokenProvider | null = null;

  constructor(baseUrl: string | undefined) {
    this.baseUrl = baseUrl;
  }

  run() {
    console.log('hello backend');
  }

  // NOTE: decouples @shared from the Firebase client SDK — the consuming app (client/)
  // registers a provider that reads the current Firebase user's ID token; the CLI never
  // registers one, so its requests stay unauthenticated (only public endpoints apply).
  setAuthTokenProvider(provider: AuthTokenProvider | null): void {
    this.authTokenProvider = provider;
  }

  async storeRepoInfo(payload: StoreRepoInfoPayload): Promise<StoreRepoInfo> {
    return this.request<StoreRepoInfo>('apiStoreRepoInfo', {
      method: 'POST',
      body: payload
    });
  }

  async getRepositoriesList(): Promise<GetRepositoriesListResponse> {
    return this.request<GetRepositoriesListResponse>('apiGetRepositoriesList');
  }

  async deleteRepoInfo(repoUrl: string): Promise<unknown> {
    const repoSlug = getRepoSlug(repoUrl);

    return this.request('apiDeleteRepoInfo', {
      method: 'POST',
      body: { repoSlug }
    });
  }

  async trackSkillsInstall(
    payload: TrackSkillsInstallPayload
  ): Promise<TrackSkillsInstallResponse> {
    return await this.request<TrackSkillsInstallResponse>(
      'apiTrackSkillsInstall',
      {
        method: 'POST',
        body: payload
      }
    );
  }

  async getFavorites(): Promise<GetFavoritesResponse> {
    return this.request<GetFavoritesResponse>('apiGetFavorites');
  }

  async addRepoFavorite(repoId: string): Promise<GetFavoritesResponse> {
    return this.request<GetFavoritesResponse>('apiAddRepoFavorite', {
      method: 'POST',
      body: { repoId }
    });
  }

  async addSkillFavorite(
    repoId: string,
    skill: string
  ): Promise<GetFavoritesResponse> {
    return this.request<GetFavoritesResponse>('apiAddSkillFavorite', {
      method: 'POST',
      body: { repoId, skill }
    });
  }

  async removeFavorite(
    repoId: string,
    skill?: string
  ): Promise<GetFavoritesResponse> {
    return this.request<GetFavoritesResponse>('apiRemoveFavorite', {
      method: 'POST',
      body: { repoId, skill }
    });
  }

  async createShareLink(repoIds?: string[]): Promise<CreateShareLinkResponse> {
    return this.request<CreateShareLinkResponse>('apiCreateShareLink', {
      method: 'POST',
      body: { repoIds }
    });
  }

  async getSharedCollection(
    shareId: string
  ): Promise<SharedCollectionResponse> {
    return this.request<SharedCollectionResponse>('apiGetSharedCollection', {
      query: { shareId }
    });
  }

  private async request<TResponse>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<TResponse> {
    const method = options.method?.toUpperCase() || 'GET';
    const queryString = options.query
      ? `?${new URLSearchParams(options.query).toString()}`
      : '';
    const url = `${this.baseUrl}/${endpoint}${queryString}`;

    const authToken = await this.authTokenProvider?.();

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers
      }
    };

    if (options.body !== undefined) {
      requestOptions.body = JSON.stringify(options.body) as BodyInit;
    }

    const response = await fetch(url, requestOptions).catch(error => {
      throw new BackendApiError(`🌐 Request to ${endpoint} failed`, {
        status: 0,
        method,
        url,
        cause: error
      });
    });

    const json = await response.json().catch(error => {
      throw new BackendApiError('Failed to parse response body', {
        status: response.status,
        method,
        url,
        cause: error
      });
    });

    if (!response.ok) {
      const message = json.error || response.statusText;

      throw new BackendApiError(
        `Backend API ${method} ${response.status} for ${endpoint}: ${message}`,
        { status: response.status, method, url }
      );
    }

    return json as TResponse;
  }
}

export const backendService = new BackendService(BACKEND_URL);
