import { GITHUB_TOKEN } from '../../config';

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
}

export const request = async (endpoint: string, options: RequestOptions) => {
  const baseUrl = 'https://api.github.com';

  const method = options.method?.toUpperCase() || 'GET';
  const url = `${baseUrl}/${endpoint}`;

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (GITHUB_TOKEN) {
    requestOptions.headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  if (options.body !== undefined) {
    requestOptions.body = JSON.stringify(options.body) as BodyInit;
  }

  // NOTE: keep it for debug purposes
  console.log(`🌐 Fetching ${method} ${url}`);

  const response = await fetch(url, requestOptions).catch(error => {
    throw new GithubApiError(`🌐 Request to ${endpoint} failed`, {
      status: 0,
      method,
      url,
      cause: error
    });
  });

  const json = await response.json().catch(error => {
    throw new GithubApiError('Failed to parse response body', {
      status: response.status,
      method,
      url,
      cause: error
    });
  });

  if (!response.ok) {
    const message = json.error || response.statusText;

    throw new GithubApiError(
      `Github API ${method} ${response.status} for ${endpoint}: ${message}`,
      { status: response.status, method, url }
    );
  }

  return json;
};

export class GithubApiError extends Error {
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
    this.name = 'GitHubApiError';
    this.status = context.status;
    this.method = context.method;
    this.url = context.url;
  }
}
