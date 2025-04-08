
import { createContext } from 'react';
import type { User } from './types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: Error | null;
  profile: {
    id?: string;
    full_name?: string;
    is_admin?: boolean;
  } | null;
  initialized: boolean;
  sessionChecked: boolean;
  setProfile: (profile: any) => void;
  updateProfile: (data: any) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ success: boolean; error: Error | null }>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
