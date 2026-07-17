import admin from 'firebase-admin';

admin.initializeApp();

import { setGlobalOptions } from 'firebase-functions';
import { onRequest } from 'firebase-functions/https';
import * as logger from 'firebase-functions/logger';

import { getRepositoriesList } from './functions/get-repositories-list';
import { helloWorld } from './functions/hello-world';
import { writeRepository } from './functions/write-repository';

setGlobalOptions({ maxInstances: 10 });

export const apiHelloWorld = onRequest((_request, response) => {
  logger.info('Hello logs!', { structuredData: true });

  const result = helloWorld();

  response.send(result);
});

export const apiWriteRepository = onRequest(async (request, response) => {
  try {
    const id = await writeRepository(request.body);

    logger.info('Repository written', { id });

    response.status(201).send({ id });
  } catch (error) {
    logger.error('Failed to write repository', { error });

    response.status(400).send({ error: 'Invalid repository payload' });
  }
});

export const apiGetRepositoriesList = onRequest(async (_request, response) => {
  try {
    const repositories = await getRepositoriesList();

    response.status(200).send({ repositories });
  } catch (error) {
    logger.error('Failed to list repositories', { error });

    response.status(500).send({ error: 'Failed to list repositories' });
  }
});
