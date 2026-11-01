import { describe, expect, it } from 'vitest';

import { parseSkillDescription } from './parse-skill-description';

const skillFile = (frontmatter: string, body = '# Skill\n\nBody text.') =>
  `---\n${frontmatter}\n---\n\n${body}\n`;

describe('parseSkillDescription', () => {
  it.each([
    [
      'a single-line description',
      'name: code-review\ndescription: Reviews code changes',
      'Reviews code changes'
    ],
    [
      'a double-quoted description',
      'description: "Reviews: code changes"',
      'Reviews: code changes'
    ],
    [
      'a single-quoted description',
      "description: 'Reviews code changes'",
      'Reviews code changes'
    ],
    [
      'a folded block description, joined into one line',
      'description: >-\n  Reviews code\n  changes carefully\nname: code-review',
      'Reviews code changes carefully'
    ],
    [
      'a literal block description, keeping its line breaks',
      'description: |-\n  Line one\n  Line two\nname: code-review',
      'Line one\nLine two'
    ],
    [
      'a plain description with indented continuation lines',
      'description: Reviews code\n  changes carefully\nname: code-review',
      'Reviews code changes carefully'
    ]
  ])('should read %s', (_label, frontmatter, expected) => {
    expect(parseSkillDescription(skillFile(frontmatter))).toBe(expected);
  });
  it('should read the description when it is not the first key', () => {
    const markdown = skillFile(
      'name: code-review\nlicense: MIT\ndescription: Reviews code changes\nversion: 1'
    );

    expect(parseSkillDescription(markdown)).toBe('Reviews code changes');
  });

  it('should ignore a leading byte order mark', () => {
    const markdown = `\uFEFF${skillFile('description: Reviews code changes')}`;

    expect(parseSkillDescription(markdown)).toBe('Reviews code changes');
  });

  it.each([
    [
      'the file has no frontmatter',
      '# Skill\n\ndescription: not frontmatter\n'
    ],
    [
      'the frontmatter is never closed',
      '---\ndescription: Reviews code changes\n# Skill\n'
    ],
    ['the frontmatter has no description', skillFile('name: code-review')],
    [
      'the description is empty',
      skillFile('name: code-review\ndescription:   ')
    ],
    ['the file is empty', ''],
    [
      'the description only appears in the body',
      skillFile('name: code-review', 'description: Appears in the body')
    ]
  ])('should return undefined when %s', (_label, markdown) => {
    expect(parseSkillDescription(markdown)).toBeUndefined();
  });
});
