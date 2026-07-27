export interface RepositoryFixture {
  repoSlug: string;
  owner: string;
  defaultBranch: string;
  skills: string[];
}

export const REPOSITORY_FIXTURES: RepositoryFixture[] = [
  {
    repoSlug: 'dosandk/SkillStack',
    owner: 'dosandk',
    defaultBranch: 'main',
    skills: ['git-commit', 'code-review', 'eleks-ui']
  },
  {
    repoSlug: 'eleks/awesome-skills',
    owner: 'eleks',
    defaultBranch: 'main',
    skills: ['dataviz', 'deep-research']
  }
];
