import { onRequest } from 'firebase-functions/https';
import { logError } from '../../utils/log-error';
import { getRepositoriesList } from './function';

export const apiGetRepositoriesList = onRequest(
  { invoker: 'public' },
  async (_request, response) => {
    try {
      const repositories = await getRepositoriesList();

      response.status(200).send({ repositories });
    } catch (error) {
      logError('Failed to list repositories', { error });

      response.status(500).send({ error: 'Failed to list repositories' });
    }
  }
);
