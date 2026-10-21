export interface ParsedRepo {
  owner: string;
  repo: string;
  ref?: string;
  path?: string;
}

const GITHUB_URL_PATTERN = /^https:\/\/github\.com\/(.+)$/;

// NOTE: /tree/<ref>/<path> URLs don't disambiguate a ref containing slashes from the
// following path segments, so the segment right after /tree/ is always treated as the ref.
export function parseRepoPath(repoUrl: string): ParsedRepo {
  const match = repoUrl.match(GITHUB_URL_PATTERN);
  const segments = match?.[1].split('/').filter(Boolean) ?? [];
  const [owner, repo, treeKeyword, ref, ...pathSegments] = segments;
  const hasInvalidTreeSuffix = treeKeyword && (treeKeyword !== 'tree' || !ref);

  if (!owner || !repo || hasInvalidTreeSuffix) {
    throw new Error(`Could not parse repository reference: ${repoUrl}`);
  }

  return {
    owner,
    repo,
    ref,
    path: pathSegments.length > 0 ? pathSegments.join('/') : undefined
  };
}
