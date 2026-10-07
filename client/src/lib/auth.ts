import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth';

import { backendService } from '@shared';
import { auth, githubProvider } from './firebase';

export type { User };

export function subscribeToAuthChanges(
  onChange: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, onChange);
}

export async function signInWithGithub(): Promise<void> {
  await signInWithPopup(auth, githubProvider);
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

async function getCurrentIdToken(): Promise<string | null> {
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}

/** Lets @shared attach the current user's ID token to protected backend requests. */
export function registerAuthTokenProvider(): void {
  backendService.setAuthTokenProvider(getCurrentIdToken);
}

export function clearAuthTokenProvider(): void {
  backendService.setAuthTokenProvider(null);
}
