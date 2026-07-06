import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';

import { contentRouter } from './routes/content';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', contentRouter);

  // 404 for any unmatched /api route.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Central error handler — surfaces db/schema validation errors as 500s.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error(err);
    res.status(500).json({ error: message });
  });

  return app;
}
