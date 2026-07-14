import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { RepoDownload, PullResult } from './interfaces';

export function writeRepoFiles(
  download: RepoDownload,
  outDir = '.'
): PullResult {
  let createdDirs = 0;
  let createdFiles = 0;

  for (const dir of download.dirs) {
    mkdirSync(join(outDir, dir), { recursive: true });
    createdDirs++;
  }

  for (const file of download.files) {
    const target = join(outDir, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content);
    createdFiles++;
    console.log(`  + ${file.path} (${file.content.length} B)`);
  }

  console.log(
    `\nDone: created ${createdFiles} file(s) and ${createdDirs} dir(s) in "${resolve(outDir)}"`
  );

  return { createdFiles, createdDirs, outDir: resolve(outDir) };
}
