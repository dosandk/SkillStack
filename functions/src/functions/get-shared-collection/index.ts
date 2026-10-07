import { onRequest } from 'firebase-functions/https';

import { logError } from '../../utils/log-error';
import { publicHttpOptions } from '../../utils/http-options';

import { getSharedCollection, SharedCollectionNotFoundError } from './function';

export const apiGetSharedCollection = onRequest(
  publicHttpOptions,
  async (request, response) => {
    const shareId = request.query.shareId;

    if (typeof shareId !== 'string' || shareId.length === 0) {
      response.status(400).send({ error: 'Missing shareId query parameter' });
      return;
    }

    try {
      const collection = await getSharedCollection(shareId);

      response.status(200).send(collection);
    } catch (error) {
      if (error instanceof SharedCollectionNotFoundError) {
        response.status(404).send({ error: error.message });
        return;
      }

      logError('Failed to get shared collection', { error, shareId });

      response.status(500).send({ error: 'Failed to get shared collection' });
    }
  }
);
