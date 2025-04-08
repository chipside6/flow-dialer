
import { createContext } from 'react';
import type { User } from './types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: Error | null;
  signOut: () => Promise<{ success: boolean; error: Error | null }>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
