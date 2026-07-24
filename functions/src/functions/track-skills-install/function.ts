import {
  repositoriesStore,
  repositorySchema
} from '../../services/repositories-store';

import { storeRepoInfo } from '../store-repo-info/function';

export type TrackSkillsInstallResult = {
  repoId: string;
  existedSkills: string[];
  missingSkills: string[];
};

export async function trackSkillsInstall(
  input: unknown
): Promise<TrackSkillsInstallResult> {
  const {
    repoSlug,
    skills = [],
    owner,
    defaultBranch
  } = repositorySchema.parse(input);

  const repository = await repositoriesStore.findByPath(repoSlug);

  let repoId = repository?.id;

  if (repository === null) {
    repoId = await storeRepoInfo({
      repoSlug,
      skills,
      owner,
      defaultBranch
    });
  }

  const { existedSkills, missingSkills } =
    await repositoriesStore.recordInstalls(repoId, skills);

  return { repoId, existedSkills, missingSkills };
}
