import { BACKEND_URL } from '../config';
import { getRepoSlug } from '../utils';

type RepositoryPayload = {
  repoSlug: string;
  author: string;
  commitHash: string;
  skills: string[];
};

type RepositoryWithId = RepositoryPayload & { id: string };

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
  repoSlug: string;
  skills: string[];
};

type TrackSkillsInstallResponse = {
  repoId: string;
  skills: string[];
};

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
}

interface RepositoryExistsResponse {
  repoId: string;
  exists: boolean;
}

export class BackendService {
  private readonly baseUrl: string | undefined;

  constructor(baseUrl: string | undefined) {
    this.baseUrl = baseUrl;
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

  async repositoryExists(repoSlug: string): Promise<RepositoryExistsResponse> {
    return this.request('apiRepositoryExists', {
      method: 'POST',
      body: { repoSlug }
    });
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

  private async request<TResponse>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<TResponse> {
    const method = options.method?.toUpperCase() || 'GET';
    const url = `${this.baseUrl}/${endpoint}`;

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
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
