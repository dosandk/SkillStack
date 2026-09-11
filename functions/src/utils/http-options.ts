import type { HttpsOptions } from 'firebase-functions/https';

// Origins allowed to call the public HTTP functions. `cors` makes
// firebase-functions answer the CORS preflight and emit the
// Access-Control-Allow-Origin header automatically.
const allowedOrigins = [
  'https://skillstack-724d8.web.app',
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/
];

// Shared options for every public HTTP handler.
export const publicHttpOptions: HttpsOptions = {
  invoker: 'public',
  cors: allowedOrigins
};
