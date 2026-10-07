import { onRequest } from 'firebase-functions/https';

import { logError } from '../../utils/log-error';
import { publicHttpOptions } from '../../utils/http-options';
import { requireAuthenticatedUser, UnauthenticatedError } from '../../utils/auth';

import { addSkillFavorite } from './function';

export const apiAddSkillFavorite = onRequest(
  publicHttpOptions,
  async (request, response) => {
    try {
      const userId = await requireAuthenticatedUser(request);
      const favorites = await addSkillFavorite(userId, request.body);

      response.status(200).send({ favorites });
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        response.status(401).send({ error: error.message });
        return;
      }

      logError('Failed to add skill favorite', { error });

      response.status(400).send({ error: 'Failed to add skill favorite' });
    }
  }
);
