import { ParsedRepo } from './interfaces';

export function parseRepo(repoUrl: string): ParsedRepo {
  const longMatch = repoUrl.match(
    /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)$/
  );

  if (longMatch) {
    return { owner: longMatch[1], repo: longMatch[2] };
  }

  const shortMatch = repoUrl.match(/^([\w.-]+)\/([\w.-]+)$/);

  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  throw new Error(`Could not parse repository reference: ${repoUrl}`);
}
