const getRepoInfo = async () => {
  return {
    owner: 'john',
    repoName: 'foo-bar',
    repoSlug: 'john/foo-bar',
    defaultBranch: 'main'
  };
};

const getRepoFiles = () => {
  return {
    owner: 'john',
    repoName: 'foo-bar',
    defaultBranch: 'main',
    dirs: ['foo', 'bar'],
    files: [
      { path: 'foo/foo.md', content: '# foo title' },
      { path: 'bar/bar.md', content: '# bar title' }
    ]
  };
};

const getSkillsList = () => {
  return ['skill-1', 'skill-2', 'skill-3'];
};

export const githubServiceMock = {
  getRepoInfo,
  getRepoFiles,
  getSkillsList
};
