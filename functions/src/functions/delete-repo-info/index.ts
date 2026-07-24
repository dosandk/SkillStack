import { onRequest } from 'firebase-functions/https';

import { logError } from '../../utils/log-error';
import { deleteRepoInfo } from './function';

export const apiDeleteRepoInfo = onRequest(
  { invoker: 'public' },
  async (request, response) => {
    try {
      await deleteRepoInfo(request.body);

      response.status(200).send({ success: true });
    } catch (error) {
      logError('Failed to delete repository', { error });

      response.status(400).send({ error: 'Failed to delete repository' });
    }
  }
);
