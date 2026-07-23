import { describe, it, expect } from 'vitest';

import { parseRepoPath } from './parse-repo-path';

describe('Repository parsing', () => {
  // NOTE: parse only full github URL
  // it('should parse owner/repo short form', () => {
  //   expect(parseRepoPath('dosandk/SkillStack')).toEqual({
  //     owner: 'dosandk',
  //     repo: 'SkillStack'
  //   });
  // });

  it('should parse a full https URL', () => {
    expect(parseRepoPath('https://github.com/dosandk/SkillStack')).toEqual({
      owner: 'dosandk',
      repo: 'SkillStack'
    });
  });

  it('should throw on an ssh remote', () => {
    expect(() =>
      parseRepoPath('git@github.com:dosandk/SkillStack.git')
    ).toThrow('Could not parse repository reference');
  });

  it('should throw on a /tree/<branch> URL', () => {
    expect(() =>
      parseRepoPath('https://github.com/dosandk/SkillStack/tree/develop')
    ).toThrow('Could not parse repository reference');
  });

  it('should throw on an unrecognizable reference', () => {
    expect(() => parseRepoPath('not a repo')).toThrow(
      'Could not parse repository reference'
    );
  });
});
