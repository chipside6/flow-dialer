
import { createContext } from 'react';
import type { User, UserProfile } from './types';

export interface AuthContextValue {
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

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
