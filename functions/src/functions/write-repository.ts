import { repositoriesStore } from '../services/repositories-store';

export async function writeRepository(input: unknown): Promise<string> {
  return await repositoriesStore.add(input);
}
