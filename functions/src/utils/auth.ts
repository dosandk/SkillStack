import { getAuth } from 'firebase-admin/auth';
import type { Request } from 'firebase-functions/https';

export class UnauthenticatedError extends Error {
  constructor(
    message = 'Missing or invalid Authorization header',
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'UnauthenticatedError';
  }
}

function extractBearerToken(request: Request): string | undefined {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return undefined;
  }

  return header.slice('Bearer '.length);
}

/** Verifies the Firebase ID token on the request and returns the caller's uid. */
export async function requireAuthenticatedUser(request: Request): Promise<string> {
  const token = extractBearerToken(request);

  if (!token) {
    throw new UnauthenticatedError();
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    return decodedToken.uid;
  } catch (error) {
    throw new UnauthenticatedError('Invalid or expired ID token', {
      cause: error
    });
  }
}
