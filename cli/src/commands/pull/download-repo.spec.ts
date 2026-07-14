import { mkdirSync, writeFileSync } from 'node:fs';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { downloadRepo } from './download-repo';

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn()
}));

const mkdirSyncMock = vi.mocked(mkdirSync);
const writeFileSyncMock = vi.mocked(writeFileSync);

const GITHUB_API = 'https://api.github.com';

function base64(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

// NOTE: maps a GitHub API pathname to its JSON response; an unknown path → 404,
// which gives downloadRepo/apiGet a natural error branch.
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

describe('downloadRepo', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should download from the repository default branch', async () => {
    const fetchMock = stubGitHubApi({
      '/repos/dosandk/SkillStack': { default_branch: 'main' },
      '/repos/dosandk/SkillStack/git/trees/main': {
        sha: 'root-sha',
        truncated: false,
        tree: []
      },
      '/repos/dosandk/SkillStack/git/trees/root-sha': {
        sha: 'root-sha',
        truncated: false,
        tree: []
      }
    });

    await downloadRepo({ repoUrl: 'dosandk/SkillStack' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${GITHUB_API}/repos/dosandk/SkillStack`,
      expect.anything()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${GITHUB_API}/repos/dosandk/SkillStack/git/trees/main`,
      expect.anything()
    );
  });

  it('should not send an Authorization header for public repos', async () => {
    const fetchMock = stubGitHubApi({
      '/repos/dosandk/SkillStack': { default_branch: 'main' },
      '/repos/dosandk/SkillStack/git/trees/main': {
        sha: 'root-sha',
        truncated: false,
        tree: []
      },
      '/repos/dosandk/SkillStack/git/trees/root-sha': {
        sha: 'root-sha',
        truncated: false,
        tree: []
      }
    });

    await downloadRepo({ repoUrl: 'dosandk/SkillStack' });

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.headers.Authorization).toBeUndefined();
  });

  it('should return decoded files and directories within depth limits', async () => {
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

    const download = await downloadRepo({ repoUrl: 'dosandk/SkillStack' });

    expect(download.dirs).toEqual(['src']);
    expect(download.files.map(file => file.path)).toEqual([
      'README.md',
      'src/index.ts'
    ]);
    expect(download.files[0].content.toString('utf8')).toBe('# Readme');
  });

  it('should warn when a directory tree is truncated', async () => {
    const warnSpy = vi.spyOn(console, 'warn');

    stubGitHubApi({
      '/repos/dosandk/SkillStack': { default_branch: 'main' },
      '/repos/dosandk/SkillStack/git/trees/main': {
        sha: 'root-sha',
        truncated: false,
        tree: []
      },
      '/repos/dosandk/SkillStack/git/trees/root-sha': {
        sha: 'root-sha',
        truncated: true,
        tree: []
      }
    });

    await downloadRepo({ repoUrl: 'dosandk/SkillStack' });

    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('should not touch the filesystem', async () => {
    stubGitHubApi({
      '/repos/dosandk/SkillStack': { default_branch: 'main' },
      '/repos/dosandk/SkillStack/git/trees/main': {
        sha: 'root-sha',
        truncated: false,
        tree: [{ path: 'README.md', type: 'blob', sha: 'blob-readme' }]
      },
      '/repos/dosandk/SkillStack/git/trees/root-sha': {
        sha: 'root-sha',
        truncated: false,
        tree: [{ path: 'README.md', type: 'blob', sha: 'blob-readme' }]
      },
      '/repos/dosandk/SkillStack/git/blobs/blob-readme': {
        content: base64('# Hello'),
        encoding: 'base64'
      }
    });

    await downloadRepo({ repoUrl: 'dosandk/SkillStack' });

    expect(mkdirSyncMock).not.toHaveBeenCalled();
    expect(writeFileSyncMock).not.toHaveBeenCalled();
  });

  it('should throw when the repository is unreachable', async () => {
    stubGitHubApi({});

    await expect(
      downloadRepo({ repoUrl: 'dosandk/SkillStack' })
    ).rejects.toThrow('GitHub API 404');
  });
});
