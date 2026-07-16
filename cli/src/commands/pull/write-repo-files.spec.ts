import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { writeRepoFiles } from './write-repo-files';

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn()
}));

const mkdirSyncMock = vi.mocked(mkdirSync);
const writeFileSyncMock = vi.mocked(writeFileSync);

function makeDownload() {
  return {
    owner: 'dosandk',
    repo: 'SkillStack',
    ref: 'main',
    dirs: ['src'],
    files: [
      { path: 'README.md', content: Buffer.from('# Hello', 'utf8') },
      {
        path: 'src/index.ts',
        content: Buffer.from('export const answer = 42', 'utf8')
      }
    ]
  };
}

describe('writeRepoFiles', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should write each downloaded file to disk', () => {
    writeRepoFiles(makeDownload(), '/tmp/out');

    expect(writeFileSyncMock).toHaveBeenCalledTimes(2);
    const [firstTarget, firstContent] = writeFileSyncMock.mock.calls[0];
    expect(firstTarget).toBe(join('/tmp/out', 'README.md'));
    expect(firstContent.toString()).toBe('# Hello');
  });

  it('should create a directory for each downloaded dir', () => {
    writeRepoFiles(makeDownload(), '/tmp/out');

    expect(mkdirSyncMock).toHaveBeenCalledWith(join('/tmp/out', 'src'), {
      recursive: true
    });
  });

  it('should return created counts and the resolved output dir', () => {
    const result = writeRepoFiles(makeDownload(), '/tmp/out');

    expect(result).toEqual({
      createdFiles: 2,
      createdDirs: 1,
      outDir: resolve('/tmp/out')
    });
  });
});
