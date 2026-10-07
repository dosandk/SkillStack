import { onRequest } from 'firebase-functions/https';

import { logError } from '../../utils/log-error';
import { publicHttpOptions } from '../../utils/http-options';
import { requireAuthenticatedUser, UnauthenticatedError } from '../../utils/auth';

import { createShareLink, NoFavoritesToShareError } from './function';

export const apiCreateShareLink = onRequest(
  publicHttpOptions,
  async (request, response) => {
    try {
      const userId = await requireAuthenticatedUser(request);
      const { shareId } = await createShareLink(userId, request.body);

      response.status(201).send({ shareId });
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        response.status(401).send({ error: error.message });
        return;
      }

      if (error instanceof NoFavoritesToShareError) {
        response.status(400).send({ error: error.message });
        return;
      }

      logError('Failed to create share link', { error });

      response.status(400).send({ error: 'Failed to create share link' });
    }
  }
);
