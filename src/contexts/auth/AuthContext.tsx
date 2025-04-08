
import { createContext } from 'react';
import type { User } from './types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: Error | null;
  signOut: () => Promise<{ success: boolean; error: Error | null }>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
  signOut: async () => ({ success: false, error: null }),
});
