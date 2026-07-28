import { describe, expect, it } from 'vitest';

import { getRepoSlug } from './get-repo-slug';

describe('getRepoSlug', () => {
  it('should return the owner/repo slug for a canonical repository URL', () => {
    const githubUrl = 'https://github.com/dosandk/SkillStack';

    const slug = getRepoSlug(githubUrl);

    expect(slug).toBe('dosandk/SkillStack');
  });

  it('should ignore a trailing slash after the repository name', () => {
    const githubUrl = 'https://github.com/dosandk/SkillStack/';

    const slug = getRepoSlug(githubUrl);

    expect(slug).toBe('dosandk/SkillStack');
  });

  it('should ignore extra path segments such as /tree/<branch>', () => {
    const githubUrl = 'https://github.com/dosandk/SkillStack/tree/main';

    const slug = getRepoSlug(githubUrl);

    expect(slug).toBe('dosandk/SkillStack');
  });

  it('should ignore a query string and hash fragment', () => {
    const githubUrl =
      'https://github.com/dosandk/SkillStack?tab=readme#install';

    const slug = getRepoSlug(githubUrl);

    expect(slug).toBe('dosandk/SkillStack');
  });

  it('should treat the host as case-insensitive', () => {
    const githubUrl = 'https://GitHub.com/dosandk/SkillStack';

    const slug = getRepoSlug(githubUrl);

    expect(slug).toBe('dosandk/SkillStack');
  });

  it('should accept the http scheme', () => {
    const githubUrl = 'http://github.com/dosandk/SkillStack';

    const slug = getRepoSlug(githubUrl);

    expect(slug).toBe('dosandk/SkillStack');
  });

  it('should keep a .git suffix as part of the repository name', () => {
    const githubUrl = 'https://github.com/dosandk/SkillStack.git';

    const slug = getRepoSlug(githubUrl);

    expect(slug).toBe('dosandk/SkillStack.git');
  });

  it('should throw for a non-github.com host', () => {
    const githubUrl = 'https://gitlab.com/dosandk/SkillStack';

    expect(() => getRepoSlug(githubUrl)).toThrow('Invalid GitHub URL');
  });

  it('should throw for a github.com subdomain', () => {
    const githubUrl = 'https://www.github.com/dosandk/SkillStack';

    expect(() => getRepoSlug(githubUrl)).toThrow('Invalid GitHub URL');
  });

  it('should throw when the repository name is missing', () => {
    const githubUrl = 'https://github.com/dosandk';

    expect(() => getRepoSlug(githubUrl)).toThrow(
      'Invalid GitHub repository URL'
    );
  });

  it('should throw when both owner and repository name are missing', () => {
    const githubUrl = 'https://github.com/';

    expect(() => getRepoSlug(githubUrl)).toThrow(
      'Invalid GitHub repository URL'
    );
  });

  it('should throw for a string that is not a valid URL', () => {
    const githubUrl = 'not a url';

    expect(() => getRepoSlug(githubUrl)).toThrow('Invalid URL');
  });
});
