import { Router } from 'express';

import { contentTypeFromPlural } from '@shared';
import { createContentRepository } from '@db';

const repo = createContentRepository();

export const contentRouter: Router = Router();

// GET /api/:type — list all entries of a content type (type is plural, e.g. "skills").
contentRouter.get('/:type', async (req, res, next) => {
  try {
    const type = contentTypeFromPlural(req.params.type);
    if (!type) {
      res
        .status(404)
        .json({ error: `Unknown content type: ${req.params.type}` });
      return;
    }
    res.json(await repo.list(type));
  } catch (err) {
    next(err);
  }
});

// GET /api/:type/:slug — fetch a single entry.
contentRouter.get('/:type/:slug', async (req, res, next) => {
  try {
    const type = contentTypeFromPlural(req.params.type);
    if (!type) {
      res
        .status(404)
        .json({ error: `Unknown content type: ${req.params.type}` });
      return;
    }
    const { slug } = req.params;
    const item = await repo.get(type, slug);
    if (!item) {
      res.status(404).json({ error: `Not found: ${req.params.type}/${slug}` });
      return;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});
