
import { createContext } from 'react';
import type { User, UserProfile } from './types';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: Error | null;
  sessionChecked: boolean;
  initialized: boolean;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (profile: UserProfile | null) => void;
  signOut: () => Promise<{ success: boolean; error: Error | null }>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
  sessionChecked: false,
  initialized: false,
  setProfile: () => {},
  updateProfile: () => {},
  signOut: async () => ({ success: false, error: null }),
});
