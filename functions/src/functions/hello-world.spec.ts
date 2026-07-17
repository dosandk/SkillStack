import { describe, it, expect } from 'vitest';

import { helloWorld } from './hello-world';

describe('helloWorld', () => {
  it('should return the greeting message', () => {
    expect(helloWorld()).toBe('Hello from Firebase!');
  });
});
