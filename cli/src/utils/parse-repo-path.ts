export interface ParsedRepo {
  owner: string;
  repo: string;
}

export function parseRepoPath(repoUrl: string): ParsedRepo {
  // NOTE: keep only full url to github, e.g https://github.com/dosandk/test-npm-skills
  const longMatch = repoUrl.match(
    /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)$/
  );

  if (longMatch) {
    return { owner: longMatch[1], repo: longMatch[2] };
  }

  // const shortMatch = repoUrl.match(/^([\w.-]+)\/([\w.-]+)$/);
  //
  // if (shortMatch) {
  //   return { owner: shortMatch[1], repo: shortMatch[2] };
  // }

  throw new Error(`Could not parse repository reference: ${repoUrl}`);
}
