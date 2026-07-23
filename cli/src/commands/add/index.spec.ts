import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('add', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should only track the install when the repository already exists', async () => {
    // TODO: implement
  });
});
