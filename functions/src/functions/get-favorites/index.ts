import { onRequest } from 'firebase-functions/https';

import { logError } from '../../utils/log-error';
import { publicHttpOptions } from '../../utils/http-options';
import { requireAuthenticatedUser, UnauthenticatedError } from '../../utils/auth';

import { getFavorites } from './function';

export const apiGetFavorites = onRequest(
  publicHttpOptions,
  async (request, response) => {
    try {
      const userId = await requireAuthenticatedUser(request);
      const favorites = await getFavorites(userId);

      response.status(200).send({ favorites });
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        response.status(401).send({ error: error.message });
        return;
      }

      logError('Failed to list favorites', { error });

      response.status(500).send({ error: 'Failed to list favorites' });
    }
  }
);
