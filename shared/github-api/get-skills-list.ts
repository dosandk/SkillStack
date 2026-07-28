import { request } from './request';
import { getRepoInfo } from './get-repo-info';

interface GitTreeEntry {
  path: string;
  type: 'blob' | 'tree';
}

interface GitTreeResponse {
  tree: GitTreeEntry[];
  truncated: boolean;
}

export const getSkillsList = async (repoUrl: string): Promise<string[]> => {
  const { defaultBranch, repoName, owner, repoSlug } =
    await getRepoInfo(repoUrl);

  console.log('owner', owner);
  console.log('repoName', repoName);

  // NOTE: fix ts error with second arg
  const tree = await request<GitTreeResponse>(
    `repos/${owner}/${repoName}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
    {}
  );

  if (tree.truncated) {
    console.warn(
      `Repository tree for ${repoSlug} is truncated — skill list may be partial`
    );
  }

  return tree.tree
    .filter(entry => entry.type === 'blob')
    .map(entry => toSkillName(entry.path))
    .filter((skillName): skillName is string => skillName !== null);
};

const toSkillName = (manifestPath: string): string | null => {
  const SKILL_MANIFEST = 'skill.md';
  const suffix = `/${SKILL_MANIFEST}`;

  if (!manifestPath.toLowerCase().endsWith(suffix)) {
    return null;
  }

  return manifestPath.slice(0, -suffix.length);
};
