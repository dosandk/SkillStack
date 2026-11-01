import { isSafeRepoSlug, isSafeSkillName } from './safe-names';

const INSTALL_COMMAND_PREFIX = 'npx skillstack-cli add';

/**
 * Returns `null` when the slug or the skill name has a character outside the
 * allowlist, because stored names are untrusted and the command is not quoted.
 */
export function buildInstallCommand(
  repoSlug: string,
  skillName: string
): string | null {
  if (!isSafeRepoSlug(repoSlug) || !isSafeSkillName(skillName)) {
    return null;
  }

  const repoUrl = `https://github.com/${repoSlug}`;

  return `${INSTALL_COMMAND_PREFIX} ${repoUrl} --skill ${skillName}`;
}
