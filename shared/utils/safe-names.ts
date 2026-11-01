const REPO_SLUG = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;
const SKILL_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * `<owner>/<repo>` made only of characters that stay literal when unquoted in
 * bash, zsh, fish, PowerShell and cmd, and that are safe in a GitHub API path.
 */
export const isSafeRepoSlug = (repoSlug: string): boolean => {
  if (!REPO_SLUG.test(repoSlug)) {
    return false;
  }

  const repo = repoSlug.slice(repoSlug.indexOf('/') + 1);

  return repo !== '.' && repo !== '..';
};

/**
 * A skill name that stays literal when unquoted in every common shell and
 * cannot be read as a CLI option (`-…`) or a dot path.
 */
export const isSafeSkillName = (skillName: string): boolean =>
  SKILL_NAME.test(skillName);
