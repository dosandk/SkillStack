import { githubService, GithubApiError } from '../../services/github/index';
import { backendService } from '../../services/backend';
import { writeRepoFiles } from './write-repo-files';

export interface AddOptions {
  repoUrl: string;
  skills: string[];
}

export const add = async (repoUrl: string, skills: string[] = []) => {
  try {
    const repoInfo = await githubService.getRepoInfo(repoUrl);
    const { owner, repoName, repoSlug, defaultBranch } = repoInfo;

    const installData = await backendService.trackSkillsInstall({
      owner,
      repoSlug,
      skills,
      defaultBranch
    });

    // NOTE: temporary keep log
    console.log('installData', installData);

    // TODO: move this logic to GithubService
    const repoFiles = await githubService.getRepoFiles({
      owner,
      repoName,
      defaultBranch
    });

    console.log('repoFiles', repoFiles);

    const writeRepoResult = await writeRepoFiles(repoFiles, '.agents');

    console.log(writeRepoResult);

    return installData;
  } catch (error) {
    console.log(error);

    if (error instanceof GithubApiError) {
      if (error.status === 404) {
        await backendService.deleteRepoInfo(repoUrl);
      }
    }

    throw error;
  }
};
