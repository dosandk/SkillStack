import { onRequest } from 'firebase-functions/https';
import { logger } from 'firebase-functions';

import { logError } from '../../utils/log-error';
import { publicHttpOptions } from '../../utils/http-options';

import { trackSkillsInstall } from './function';

export const apiTrackSkillsInstall = onRequest(
  publicHttpOptions,
  async (request, response) => {
    try {
      const result = await trackSkillsInstall(request.body);

      logger.log('Install tracked', result);

      response.status(200).send(result);
    } catch (error) {
      logError('Failed to track install', { error });

      response.status(400).send({ error: 'Failed to track install' });
    }
  }
);
