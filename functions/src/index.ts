import admin from 'firebase-admin';

admin.initializeApp();

import { setGlobalOptions } from 'firebase-functions';

setGlobalOptions({ maxInstances: 10 });

export { apiTrackSkillsInstall } from './functions/track-skills-install/index';
export { apiStoreRepoInfo } from './functions/store-repo-info/index';
export { apiGetRepositoriesList } from './functions/get-repositories-list/index';
export { apiDeleteRepoInfo } from './functions/delete-repo-info/index';
