import { isSafeRepoSlug, parseSkillDescription } from '../utils';
import { request } from './request';

interface GitTreeEntry {
  path: string;
  sha: string;
  type: 'blob' | 'tree';
}

interface GitTreeResponse {
  tree: GitTreeEntry[];
  truncated: boolean;
}

interface GitBlobResponse {
  content: string;
  encoding: string;
}

export interface GetSkillDescriptionsOptions {
  repoSlug: string;
  defaultBranch: string;
  skillNames: string[];
}

const SKILL_MANIFEST_SUFFIX = '/skill.md';

const toManifestDir = (path: string): string | null =>
  path.toLowerCase().endsWith(SKILL_MANIFEST_SUFFIX)
    ? path.slice(0, -SKILL_MANIFEST_SUFFIX.length)
    : null;

const decodeBlob = ({ content, encoding }: GitBlobResponse): string => {
  if (encoding !== 'base64') {
    return content;
  }

  // NOTE: atob + TextDecoder instead of Buffer, so it also runs in the browser
  const binary = atob(content.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

/**
 * Reads the `description` of each skill's SKILL.md from GitHub. A skill without
 * a SKILL.md, without a description or whose file cannot be read is omitted.
 * A failed tree request rejects with a `GithubApiError`.
 */
export const getSkillDescriptions = async ({
  repoSlug,
  defaultBranch,
  skillNames
}: GetSkillDescriptionsOptions): Promise<Record<string, string>> => {
  if (!isSafeRepoSlug(repoSlug)) {
    throw new Error('Unsafe repository slug');
  }

  if (skillNames.length === 0) {
    return {};
  }

  const tree = await request<GitTreeResponse>(
    `repos/${repoSlug}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`
  );

  const manifests = tree.tree.flatMap(entry => {
    const dir = entry.type === 'blob' ? toManifestDir(entry.path) : null;

    return dir === null ? [] : [{ dir, sha: entry.sha }];
  });

  const found = skillNames.flatMap(name => {
    const manifest = manifests.find(
      ({ dir }) => dir === name || dir.endsWith(`/${name}`)
    );

    return manifest ? [{ name, sha: manifest.sha }] : [];
  });

  const results = await Promise.allSettled(
    found.map(async ({ name, sha }) => {
      const blob = await request<GitBlobResponse>(
        `repos/${repoSlug}/git/blobs/${sha}`
      );

      return { name, description: parseSkillDescription(decodeBlob(blob)) };
    })
  );

  const descriptions: Record<string, string> = {};

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.description) {
      descriptions[result.value.name] = result.value.description;
    }
  }

  return descriptions;
};
