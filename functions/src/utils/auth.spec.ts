import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request } from 'firebase-functions/https';

const { verifyIdToken } = vi.hoisted(() => ({
  verifyIdToken: vi.fn()
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken })
}));

import {
  requireAuthenticatedUser,
  UnauthenticatedError
} from './auth';

function createRequest(authorization?: string): Request {
  return {
    headers: authorization ? { authorization } : {}
  } as Request;
}

describe('requireAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject requests without a Bearer token', async () => {
    await expect(requireAuthenticatedUser(createRequest())).rejects.toThrow(
      UnauthenticatedError
    );
    await expect(requireAuthenticatedUser(createRequest())).rejects.toThrow(
      'Missing or invalid Authorization header'
    );
  });

  it('should reject requests with an invalid Bearer token', async () => {
    verifyIdToken.mockRejectedValue(new Error('expired'));

    await expect(
      requireAuthenticatedUser(createRequest('Bearer bad-token'))
    ).rejects.toThrow(UnauthenticatedError);
    await expect(
      requireAuthenticatedUser(createRequest('Bearer bad-token'))
    ).rejects.toThrow('Invalid or expired ID token');
  });

  it('should return the uid when the Bearer token is valid', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'user-123' });

    const uid = await requireAuthenticatedUser(
      createRequest('Bearer valid-token')
    );

    expect(uid).toBe('user-123');
    expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
  });
});
