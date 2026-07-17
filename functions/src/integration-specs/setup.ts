import admin from 'firebase-admin';

import { HOST, PROJECT_ID } from './config';

admin.initializeApp({ projectId: PROJECT_ID });

export const db = admin.firestore();

export async function clearFirestore() {
  await fetch(
    `http://${HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );
}
