import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { parseRepo } from './parse-repo';

describe('Repository parsing', () => {
  it('should parse owner/repo short form', () => {
    expect(parseRepo('dosandk/SkillStack')).toEqual({
      owner: 'dosandk',
      repo: 'SkillStack'
    });
  });

  it('should parse a full https URL', () => {
    expect(parseRepo('https://github.com/dosandk/SkillStack')).toEqual({
      owner: 'dosandk',
      repo: 'SkillStack'
    });
  });

  it('should throw on an ssh remote', () => {
    expect(() => parseRepo('git@github.com:dosandk/SkillStack.git')).toThrow(
      'Could not parse repository reference'
    );
  });

  it('should throw on a /tree/<branch> URL', () => {
    expect(() =>
      parseRepo('https://github.com/dosandk/SkillStack/tree/develop')
    ).toThrow('Could not parse repository reference');
  });

  it('should throw on an unrecognizable reference', () => {
    expect(() => parseRepo('not a repo')).toThrow(
      'Could not parse repository reference'
    );
  });
});
