import { request } from './request';

interface RepoFile {
  path: string;
  content: Buffer;
}

interface RepoDownload {
  owner: string;
  repoName: string;
  defaultBranch: string;
}

interface TreeEntry {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
}

interface GitTreeResponse {
  sha: string;
  truncated: boolean;
  tree: TreeEntry[];
}

const FILE_DEPTH = 3;
const DIR_DEPTH = 2;

async function getBlob(
  owner: string,
  repo: string,
  sha: string
): Promise<Buffer> {
  const endpoint = `repos/${owner}/${repo}/git/blobs/${sha}`;
  const blob = await request<{ content: string; encoding: string }>(
    endpoint,
    {}
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
  const endpoint = `repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}`;
  const root = await request<GitTreeResponse>(endpoint, {});

  const treeEntries: TreeEntry[] = [];
  const queue = [{ sha: root.sha, prefix: '', depth: 1 }];

  while (queue.length > 0) {
    const { sha, prefix, depth } = queue.shift()!;
    const endpoint = `repos/${owner}/${repo}/git/trees/${sha}`;
    const subtree = await request<GitTreeResponse>(endpoint, {});

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

export async function getRepoFiles({
  owner,
  repoName,
  defaultBranch
}: RepoDownload): Promise<unknown> {
  console.log(`Repository: ${owner}/${repoName} (ref: ${defaultBranch})`);

  const tree = await getTree(owner, repoName, defaultBranch);

  const dirs: string[] = [];
  const files: RepoFile[] = [];

  for (const entry of tree) {
    const depth = entry.path.split('/').length;

    if (entry.type === 'tree') {
      if (depth <= DIR_DEPTH) dirs.push(entry.path);
      continue;
    }

    if (depth <= FILE_DEPTH) {
      const content = await getBlob(owner, repoName, entry.sha);
      files.push({ path: entry.path, content });
    }
  }

  return { owner, repoName, defaultBranch, dirs, files };
}
