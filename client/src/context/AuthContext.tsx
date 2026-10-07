import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import {
  clearAuthTokenProvider,
  registerAuthTokenProvider,
  signInWithGithub,
  signOutUser,
  subscribeToAuthChanges,
  type User
} from '../lib/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    registerAuthTokenProvider();

    const unsubscribe = subscribeToAuthChanges(nextUser => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      clearAuthTokenProvider();
    };
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    signIn: signInWithGithub,
    signOut: signOutUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// NOTE: react-refresh/only-export-components flags the useX-from-a-context-file
// pattern, but colocating the hook with its Provider is the convention this repo's
// react-client.mdc rule asks for — the false positive is safe to disable here.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
