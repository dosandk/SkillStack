import { request } from './request';
import { parseRepoPath } from '../utils';

interface GithubRepoDetails {
  full_name: string;
  name: string;
  default_branch: string;
  owner: {
    login: string;
  };
}

interface RepoInfo {
  owner: string;
  repoName: string;
  repoSlug: string;
  defaultBranch: string;
  path?: string;
}

export const getRepoInfo = async (repoUrl: string): Promise<RepoInfo> => {
  const { owner, repo, ref, path } = parseRepoPath(repoUrl);

  const repoDetails = await request<GithubRepoDetails>(
    `repos/${owner}/${repo}`,
    {}
  );

  return {
    owner: repoDetails.owner.login,
    repoName: repoDetails.name,
    repoSlug: repoDetails.full_name,
    // NOTE: a ref from a /tree/<ref>/<path> URL takes priority over the repo's actual
    // default branch — the user explicitly asked for that branch.
    defaultBranch: ref || repoDetails.default_branch,
    path
  };
};
