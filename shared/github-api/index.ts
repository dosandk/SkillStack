import { getRepoInfo } from './get-repo-info';
import { getSkillsList } from './get-skills-list';
import { getRepoFiles } from './get-repo-files';
import { getSkillDescriptions } from './get-skill-descriptions';

export { GithubApiError } from './request';

interface GithubService {
  getRepoInfo: typeof getRepoInfo;
  getRepoFiles: typeof getRepoFiles;
  getSkillsList: typeof getSkillsList;
  getSkillDescriptions: typeof getSkillDescriptions;
}

let githubService: GithubService = {
  getRepoInfo,
  getRepoFiles,
  getSkillsList,
  getSkillDescriptions
};

// TODO: rethink this
// NOTE: dynamic import inside the development guard — tsup inlines process.env.NODE_ENV
// at build time, so the production bundle drops this branch (and the mock module) entirely.
if (import.meta.env?.DEV) {
  const { githubServiceMock } = await import('./mock/index');

  githubService = githubServiceMock as unknown as GithubService;
}

export { githubService };
