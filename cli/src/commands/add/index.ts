import {
  backendService,
  githubService,
  GithubApiError,
  parseShareReference
} from '@shared';
import { writeRepoFiles } from './write-repo-files';

export interface AddOptions {
  repoUrl: string;
  skills: string[];
}

export const add = async (target: string, skills: string[] = []) => {
  const shareId = parseShareReference(target);

  if (shareId) {
    return addFromShareLink(shareId);
  }

  return addFromRepoUrl(target, skills);
};

// NOTE: fetches the shared collection then reuses addFromRepoUrl per entry — the
// normal per-repo install flow, not a parallel path — per issue #13's CLI requirement.
const addFromShareLink = async (shareId: string) => {
  const { entries } = await backendService.getSharedCollection(shareId);

  const results = [];

  for (const entry of entries) {
    const repoUrl = `https://github.com/${entry.repoSlug}`;
    const skillNames = entry.skills === 'all' ? [] : entry.skills;

    results.push(await addFromRepoUrl(repoUrl, skillNames));
  }

  return results;
};

const addFromRepoUrl = async (repoUrl: string, skills: string[] = []) => {
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

    const repoFiles = await githubService.getRepoFiles({
      owner,
      repoName,
      defaultBranch
    });

    console.log('repoFiles', repoFiles);

    const writeRepoResult = writeRepoFiles(repoFiles, '.agents');

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
