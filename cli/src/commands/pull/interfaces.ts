export interface PullOptions {
  repoUrl: string;
  outDir?: string;
}

export interface PullResult {
  createdFiles: number;
  createdDirs: number;
  outDir: string;
}

export interface DownloadOptions {
  repoUrl: string;
}

export interface RepoFile {
  path: string;
  content: Buffer;
}

export interface RepoDownload {
  owner: string;
  repo: string;
  ref: string;
  dirs: string[];
  files: RepoFile[];
}

export interface ParsedRepo {
  owner: string;
  repo: string;
}

export interface TreeEntry {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
}

export interface GitTreeResponse {
  sha: string;
  truncated: boolean;
  tree: TreeEntry[];
}
