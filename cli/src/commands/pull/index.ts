import { PullOptions, PullResult } from './interfaces';
import { downloadRepo } from './download-repo';
import { writeRepoFiles } from './write-repo-files';

export async function pull({
  repoUrl,
  outDir = '.'
}: PullOptions): Promise<PullResult> {
  const download = await downloadRepo({ repoUrl });

  return writeRepoFiles(download, outDir);
}
