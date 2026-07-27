export const PROJECT_ID = 'skillstack-724d8';

// NOTE: dedicated e2e port (not Vite's default 5173) so the suite never clashes
// with a running `npm run dev`. Kept in sync with the port in global-setup.ts.
export const APP_PORT = 5273;

export const APP_URL = `http://localhost:${APP_PORT}`;

export const FUNCTIONS_BASE_URL = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;

export const FIRESTORE_HOST = '127.0.0.1:8080';
