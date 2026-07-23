import { request } from './request';
import { parseRepoPath } from '../../utils';

interface getRepoInfoDto {
  owner: string;
  repoName: string;
  repoSlug: string;
  defaultBranch: string;
}

interface GithubRepoDetails {
  full_name: string;
  name: string;
  default_branch: string;
  owner: {
    login: string;
  };
}

export const getRepoInfo = async (repoUrl: string): Promise<getRepoInfoDto> => {
  const { owner, repo } = parseRepoPath(repoUrl);

  // NOTE: fix ts error for second optional arg
  const repoDetails = await request<GithubRepoDetails>(
    `repos/${owner}/${repo}`,
    {}
  );

  return {
    owner: repoDetails.owner.login,
    repoName: repoDetails.name,
    repoSlug: repoDetails.full_name,
    defaultBranch: repoDetails.default_branch
  };
};
