import { onRequest } from 'firebase-functions/https';
import { ZodError } from 'zod';

import { logError } from '../../utils/log-error';
import { publicHttpOptions } from '../../utils/http-options';

import { getRepositoryDetails } from './function';

export const apiGetRepositoryDetails = onRequest(
  publicHttpOptions,
  async (request, response) => {
    try {
      const details = await getRepositoryDetails(request.query);

      if (!details) {
        response.status(404).send({ error: 'Repository not found' });

        return;
      }

      response.status(200).send(details);
    } catch (error) {
      if (error instanceof ZodError) {
        response.status(400).send({ error: 'Invalid repository id' });

        return;
      }

      logError('Failed to get repository details', { error });

      response.status(500).send({ error: 'Failed to get repository details' });
    }
  }
);
