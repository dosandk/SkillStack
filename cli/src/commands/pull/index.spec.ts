import { mkdirSync, writeFileSync } from 'node:fs';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { pull } from './index';

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn()
}));

const writeFileSyncMock = vi.mocked(writeFileSync);

const GITHUB_API = 'https://api.github.com';

function base64(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

function stubGitHubApi(responsesByPath: Record<string, unknown>) {
  const fetchMock = vi.fn(async (requestUrl: string) => {
    const pathname = requestUrl.replace(GITHUB_API, '');
    if (pathname in responsesByPath) {
      return {
        ok: true,
        status: 200,
        json: async () => responsesByPath[pathname]
      };
    }
    return {
      ok: false,
      status: 404,
      text: async () => `not found: ${pathname}`
    };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('pull', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should download the repository and write it to disk', async () => {
    stubGitHubApi({
      '/repos/dosandk/SkillStack': { default_branch: 'main' },
      '/repos/dosandk/SkillStack/git/trees/main': {
        sha: 'root-sha',
        truncated: false,
        tree: [
          { path: 'README.md', type: 'blob', sha: 'blob-readme' },
          { path: 'src', type: 'tree', sha: 'src-sha' }
        ]
      },
      '/repos/dosandk/SkillStack/git/trees/root-sha': {
        sha: 'root-sha',
        truncated: false,
        tree: [
          { path: 'README.md', type: 'blob', sha: 'blob-readme' },
          { path: 'src', type: 'tree', sha: 'src-sha' }
        ]
      },
      '/repos/dosandk/SkillStack/git/trees/src-sha': {
        sha: 'src-sha',
        truncated: false,
        tree: [{ path: 'index.ts', type: 'blob', sha: 'blob-index' }]
      },
      '/repos/dosandk/SkillStack/git/blobs/blob-readme': {
        content: base64('# Readme'),
        encoding: 'base64'
      },
      '/repos/dosandk/SkillStack/git/blobs/blob-index': {
        content: base64('export const answer = 42'),
        encoding: 'base64'
      }
    });

    const result = await pull({
      repoUrl: 'dosandk/SkillStack',
      outDir: '/tmp/out'
    });

    expect(result.createdFiles).toBe(2);
    expect(result.createdDirs).toBe(1);
    expect(writeFileSyncMock).toHaveBeenCalledTimes(2);
  });
});
