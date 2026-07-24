import { logger } from 'firebase-functions';
import util from 'node:util';

export function logError(message: string, error: unknown) {
  if (process.env.FUNCTIONS_EMULATOR) {
    console.error(`\n❌ ${message}`);

    if (error instanceof Error) {
      console.error(error);
    } else {
      console.error(
        util.inspect(error, {
          depth: null,
          colors: true,
          compact: false
        })
      );
    }

    return;
  }

  logger.error(message, error);
}
