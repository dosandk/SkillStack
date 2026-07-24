// NOTE: kept in sync with src/integration-specs/config.ts — inlined rather than imported
// because these scripts run via `node --experimental-strip-types` (ESM) and live outside
// the `src` tsc build, so they stay fully self-contained.
export const PROJECT_ID = 'skillstack-724d8';
export const EMULATOR_HOST = '127.0.0.1:8080';

const LOOPBACK_HOSTS = ['127.0.0.1', 'localhost', '::1', '0.0.0.0'];

/**
 * NOTE: default the Admin SDK to the local emulator (mirrors integration-specs/setup.ts)
 * so a plain script run never touches production Firestore.
 */
export function useEmulator(): void {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = EMULATOR_HOST;
  }
}

/** Refuse to run against anything but a loopback (local emulator) host. */
export function assertLocalEmulator(): void {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST ?? '';
  const hostname = emulatorHost.replace(/:\d+$/, '');

  if (!LOOPBACK_HOSTS.includes(hostname)) {
    throw new Error(
      `Refusing to run against a non-emulator Firestore host "${emulatorHost}" (production access blocked)`
    );
  }
}

/**
 * Delete every document in the emulator. The `/emulator/v1/.../documents` endpoint
 * exists only on the Firestore emulator, so this can never reach production.
 */
export async function clearAllRecords(): Promise<void> {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST ?? EMULATOR_HOST;

  const response = await fetch(
    `http://${emulatorHost}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(`Failed to clear Firestore emulator (${response.status})`);
  }
}
