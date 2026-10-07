import { describe, expect, it } from 'vitest';

import { parseShareReference } from './parse-share-reference';

const shareId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('parseShareReference', () => {
  it('should extract the share id from a full shared collection URL', () => {
    const sharedUrl = `https://skillstack.example.com/shared/${shareId}`;

    const parsed = parseShareReference(sharedUrl);

    expect(parsed).toBe(shareId);
  });

  it('should extract the share id from a URL with query parameters', () => {
    const sharedUrl = `https://skillstack.example.com/shared/${shareId}?ref=cli`;

    const parsed = parseShareReference(sharedUrl);

    expect(parsed).toBe(shareId);
  });

  it('should accept a bare UUID share id', () => {
    const parsed = parseShareReference(shareId);

    expect(parsed).toBe(shareId);
  });

  it('should trim surrounding whitespace before parsing', () => {
    const parsed = parseShareReference(`  ${shareId}  `);

    expect(parsed).toBe(shareId);
  });

  it('should return null for a repository URL', () => {
    const repoUrl = 'https://github.com/octocat/hello-world';

    const parsed = parseShareReference(repoUrl);

    expect(parsed).toBeNull();
  });

  it('should return null for an invalid share id string', () => {
    const parsed = parseShareReference('not-a-share-id');

    expect(parsed).toBeNull();
  });
});
