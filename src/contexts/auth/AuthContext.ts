
import { createContext } from 'react';
import { User, UserProfile } from './types';

interface AuthContextProps {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean | null;
  error: Error | null;
  sessionChecked: boolean;
  initialized: boolean;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (profile: UserProfile | null) => void;
  signOut: () => Promise<{ success: boolean, error: Error | null }>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: null,
  error: null,
  sessionChecked: false,
  initialized: false,
  setProfile: () => {},
  updateProfile: () => {},
  signOut: async () => ({ success: false, error: null }),
});
