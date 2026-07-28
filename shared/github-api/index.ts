import { getRepoInfo } from './get-repo-info';
import { getSkillsList } from './get-skills-list';
import { getRepoFiles } from './get-repo-files';

export { GithubApiError } from './request';

interface GithubService {
  getRepoInfo: typeof getRepoInfo;
  getRepoFiles: typeof getRepoFiles;
  getSkillsList: typeof getSkillsList;
}

let githubService: GithubService = {
  getRepoInfo,
  getRepoFiles,
  getSkillsList
};

// TODO: rethink this
// NOTE: dynamic import inside the development guard — tsup inlines process.env.NODE_ENV
// at build time, so the production bundle drops this branch (and the mock module) entirely.
if (import.meta.env.DEV) {
  const { githubServiceMock } = await import('./mock/index');

  githubService = githubServiceMock as GithubService;
}

export { githubService };
