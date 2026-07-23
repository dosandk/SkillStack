import { getRepoInfo } from './get-repo-info';
import { getSkillsList } from './get-skills-list';
import { getRepoFiles } from './get-repo-files.ts';

export { GithubApiError } from './request';

export const githubService = {
  getRepoInfo,
  getRepoFiles,
  getSkillsList
};
