import { onRequest } from 'firebase-functions/https';
import { logger } from 'firebase-functions';

import { logError } from '../../utils/log-error';

import { storeRepoInfo } from './function';

export const apiStoreRepoInfo = onRequest(
  { invoker: 'public' },
  async (request, response) => {
    try {
      console.log(request.body);

      const id = await storeRepoInfo(request.body);

      logger.log('Repository written', { id });

      response.status(201).send({ id });
    } catch (error) {
      logError('Failed to write repository', { error });

      response.status(400).send({ error: 'Invalid repository payload' });
    }
  }
);
