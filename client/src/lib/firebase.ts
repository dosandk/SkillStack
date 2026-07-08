import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GithubAuthProvider
} from 'firebase/auth';

// NOTE: these are public Firebase web-config identifiers, not secrets — they ship
// in the client bundle regardless. Security comes from Firebase rules, authorized
// domains, and provider config, so keeping them in source is fine.
const firebaseConfig = {
  apiKey: 'AIzaSyCKbpR4_vM_4LviOCXpAsjDKwXX8tjMXA8',
  authDomain: 'skillstack-724d8.firebaseapp.com',
  projectId: 'skillstack-724d8',
  storageBucket: 'skillstack-724d8.firebasestorage.app',
  messagingSenderId: '885666948445',
  appId: '1:885666948445:web:9d1515e7e27363a341f4b4'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();

// NOTE: in dev, route auth to the local Auth emulator (run `npm run emulators`) so
// GitHub sign-in works without a real OAuth app; production hits real Firebase.
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}
