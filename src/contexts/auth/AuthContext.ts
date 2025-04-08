
import { createContext } from 'react';
import type { User } from './types';
import type { UserProfile } from './types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: Error | null;
  profile: UserProfile | null;
  initialized: boolean;
  sessionChecked: boolean;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ success: boolean; error: Error | null }>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
