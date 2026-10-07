import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const shareId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

vi.mock('@shared', () => ({
  backendService: {
    getSharedCollection: vi.fn(),
    trackSkillsInstall: vi.fn(),
    deleteRepoInfo: vi.fn()
  },
  githubService: {
    getRepoInfo: vi.fn(),
    getRepoFiles: vi.fn()
  },
  GithubApiError: class GithubApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
      super(message);
      this.status = status;
    }
  },
  parseShareReference: vi.fn()
}));

vi.mock('./write-repo-files', () => ({
  writeRepoFiles: vi.fn(() => ({ createdFiles: 1, createdDirs: 0 }))
}));

import {
  backendService,
  githubService,
  parseShareReference
} from '@shared';

import { add } from './index';
import { writeRepoFiles } from './write-repo-files';

describe('add', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(parseShareReference).mockReturnValue(null);
    vi.mocked(backendService.getSharedCollection).mockResolvedValue({
      shareId,
      ownerId: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      entries: [
        {
          repoId: 'repo-1',
          repoSlug: 'octocat/alpha',
          owner: 'octocat',
          defaultBranch: 'main',
          skills: ['testing']
        },
        {
          repoId: 'repo-2',
          repoSlug: 'octocat/beta',
          owner: 'octocat',
          defaultBranch: 'main',
          skills: 'all'
        }
      ]
    });
    vi.mocked(githubService.getRepoInfo).mockImplementation(async repoUrl => {
      if (repoUrl.includes('octocat/beta')) {
        return {
          owner: 'octocat',
          repoName: 'beta',
          repoSlug: 'octocat/beta',
          defaultBranch: 'main'
        };
      }

      return {
        owner: 'octocat',
        repoName: 'alpha',
        repoSlug: 'octocat/alpha',
        defaultBranch: 'main'
      };
    });
    vi.mocked(backendService.trackSkillsInstall).mockResolvedValue({
      repoId: 'repo-1',
      existedSkills: [],
      missingSkills: ['testing']
    });
    vi.mocked(githubService.getRepoFiles).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should install each repository from a shared collection link', async () => {
    vi.mocked(parseShareReference).mockReturnValue(shareId);

    const results = await add(`https://skillstack.example.com/shared/${shareId}`);

    expect(backendService.getSharedCollection).toHaveBeenCalledWith(shareId);
    expect(githubService.getRepoInfo).toHaveBeenCalledTimes(2);
    expect(backendService.trackSkillsInstall).toHaveBeenCalledWith({
      owner: 'octocat',
      repoSlug: 'octocat/alpha',
      skills: ['testing'],
      defaultBranch: 'main'
    });
    expect(backendService.trackSkillsInstall).toHaveBeenCalledWith({
      owner: 'octocat',
      repoSlug: 'octocat/beta',
      skills: [],
      defaultBranch: 'main'
    });
    expect(writeRepoFiles).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(2);
  });

  it('should use the repository install path when the target is not a share link', async () => {
    const repoUrl = 'https://github.com/octocat/hello-world';

    await add(repoUrl, ['linting']);

    expect(backendService.getSharedCollection).not.toHaveBeenCalled();
    expect(backendService.trackSkillsInstall).toHaveBeenCalledWith(
      expect.objectContaining({
        repoSlug: 'octocat/alpha',
        skills: ['linting']
      })
    );
  });
});
