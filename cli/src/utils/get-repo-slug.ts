export function getRepoSlug(githubUrl: string): string {
  const url = new URL(githubUrl);

  if (url.hostname !== 'github.com') {
    throw new Error('Invalid GitHub URL');
  }

  const [owner, repoName] = url.pathname.split('/').filter(Boolean);

  if (!owner || !repoName) {
    throw new Error('Invalid GitHub repository URL');
  }

  return `${owner}/${repoName}`;
}
