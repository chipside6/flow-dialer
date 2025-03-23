
import React, { createContext } from 'react';
import { User, UserProfile } from './types';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
  error: Error | null;
  sessionChecked: boolean;
  initialized: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setIsAffiliate: (isAffiliate: boolean) => void;
  signOut: () => Promise<{ success: boolean; error: any | null }>;
  updateProfile: (profile: UserProfile | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
