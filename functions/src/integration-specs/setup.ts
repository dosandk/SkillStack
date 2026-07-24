import admin from 'firebase-admin';

import { HOST, PROJECT_ID } from './config';

// NOTE: route the Admin SDK to the local emulator so the suite runs against
// already-running emulators (`npm run test:integration`), not just under
// `emulators:exec`, which would otherwise inject this itself.
// process.env.FIRESTORE_EMULATOR_HOST ??= HOST;
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = HOST;
}

admin.initializeApp({ projectId: PROJECT_ID });

export const db = admin.firestore();

export async function clearFirestore() {
  await fetch(
    `http://${HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );
}
