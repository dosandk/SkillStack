import { describe, it, expect } from 'vitest';

import { sum } from './sum.js';

describe('sum', () => {
  it('should add two numbers', () => {
    const first = 1;
    const second = 2;

    const total = sum(first, second);

    expect(total).toBe(3);
  });
});
