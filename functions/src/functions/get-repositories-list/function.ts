import { repositoriesStore } from '../../services/repositories-store';

export async function getRepositoriesList() {
  return await repositoriesStore.list();
}
