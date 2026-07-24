import {
  assertLocalEmulator,
  clearAllRecords,
  useEmulator
} from './emulator.ts';

useEmulator();

async function clear(): Promise<void> {
  assertLocalEmulator();

  await clearAllRecords();

  console.log(
    `✅ Cleared all Firestore records at ${process.env.FIRESTORE_EMULATOR_HOST}`
  );
}

clear().catch(error => {
  console.error('🔴 Clearing failed:', error);
  process.exitCode = 1;
});
