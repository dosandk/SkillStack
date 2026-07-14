import {
  DownloadOptions,
  RepoDownload,
  RepoFile,
  TreeEntry,
  GitTreeResponse
} from './interfaces';
import { parseRepo } from './parse-repo';

// NOTE: two separate depth limits — files are pulled up to nesting level 3
// inclusive, while directories are materialized only up to level 2 (deeper ones
// are created implicitly together with files via recursive).
const FILE_DEPTH = 3;
const DIR_DEPTH = 2;

const GITHUB_API = 'https://api.github.com';

// NOTE: the Blobs API returns content in base64, so both text and binary files
// are restored correctly.
async function getBlob(
  owner: string,
  repo: string,
  sha: string
): Promise<Buffer> {
  const blob = await apiGet<{ content: string; encoding: string }>(
    `/repos/${owner}/${repo}/git/blobs/${sha}`
  );
  if (blob.encoding === 'base64') {
    return Buffer.from(blob.content, 'base64');
  }
  return Buffer.from(blob.content || '', 'utf8');
}

// NOTE: shallow level-by-level traversal (BFS) — each directory is requested with
// its own non-recursive call, so truncation is nearly unreachable (unlike
// recursive=1). ref (branch/tag/SHA) pins the tree state, and with it the blob SHAs.
async function getTree(
  owner: string,
  repo: string,
  ref: string
): Promise<TreeEntry[]> {
  const root = await apiGet<GitTreeResponse>(
    `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}`
  );

  const treeEntries: TreeEntry[] = [];
  const queue = [{ sha: root.sha, prefix: '', depth: 1 }];

  while (queue.length > 0) {
    const { sha, prefix, depth } = queue.shift()!;
    const subtree = await apiGet<GitTreeResponse>(
      `/repos/${owner}/${repo}/git/trees/${sha}`
    );
    if (subtree.truncated) {
      console.warn(
        `Directory "${prefix || '/'}" is truncated — result may be partial`
      );
    }

    for (const entry of subtree.tree) {
      const fullPath = prefix ? `${prefix}/${entry.path}` : entry.path;
      treeEntries.push({ path: fullPath, type: entry.type, sha: entry.sha });

      if (entry.type === 'tree' && depth < FILE_DEPTH) {
        queue.push({ sha: entry.sha, prefix: fullPath, depth: depth + 1 });
      }
    }
  }

  return treeEntries;
}

async function apiGet<T>(pathname: string): Promise<T> {
  const headers = {
    Accept: 'application/vnd.github+json'
  };

  const response = await fetch(`${GITHUB_API}${pathname}`, { headers }).catch(
    error => {
      throw new Error(`Failed to reach GitHub API at ${pathname}`, {
        cause: error
      });
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `GitHub API ${response.status} for ${pathname}: ${errorBody.slice(0, 200)}`
    );
  }

  return response.json() as Promise<T>;
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const repoInfo = await apiGet<{ default_branch: string }>(
    `/repos/${owner}/${repo}`
  );
  return repoInfo.default_branch;
}

export async function downloadRepo({
  repoUrl
}: DownloadOptions): Promise<RepoDownload> {
  const { owner, repo } = parseRepo(repoUrl);
  // NOTE: always pull from the repository default branch.
  const resolvedRef = await getDefaultBranch(owner, repo);
  console.log(`Repository: ${owner}/${repo} (ref: ${resolvedRef})`);

  const tree = await getTree(owner, repo, resolvedRef);

  const dirs: string[] = [];
  const files: RepoFile[] = [];

  for (const entry of tree) {
    const depth = entry.path.split('/').length;

    if (entry.type === 'tree') {
      if (depth <= DIR_DEPTH) dirs.push(entry.path);
      continue;
    }

    if (depth <= FILE_DEPTH) {
      const content = await getBlob(owner, repo, entry.sha);
      files.push({ path: entry.path, content });
    }
  }

  return { owner, repo, ref: resolvedRef, dirs, files };
}
