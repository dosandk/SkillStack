import { request } from './request';

interface CommitResponse {
  sha: string;
  html_url: string;
}

interface CommitInfo {
  sha: string;
  htmlUrl: string;
}

export const gitCommitInfo = async (
  owner: string,
  repoName: string,
  branchName: string
): Promise<CommitInfo> => {
  const endpoint = `repos/${owner}/${repoName}/commits/${branchName}`;

  const commitInfo = (await request(endpoint, {})) as CommitResponse;

  const { sha, html_url } = commitInfo;

  return {
    sha,
    htmlUrl: html_url
  };
};
