import { onRequest } from 'firebase-functions/https';

import { logError } from '../../utils/log-error';
import { publicHttpOptions } from '../../utils/http-options';
import { requireAuthenticatedUser, UnauthenticatedError } from '../../utils/auth';

import { removeFavorite } from './function';

export const apiRemoveFavorite = onRequest(
  publicHttpOptions,
  async (request, response) => {
    try {
      const userId = await requireAuthenticatedUser(request);
      const favorites = await removeFavorite(userId, request.body);

      response.status(200).send({ favorites });
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        response.status(401).send({ error: error.message });
        return;
      }

      logError('Failed to remove favorite', { error });

      response.status(400).send({ error: 'Failed to remove favorite' });
    }
  }
);
