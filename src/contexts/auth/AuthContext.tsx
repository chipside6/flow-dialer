
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
  setProfile: (profile: UserProfile | null) => void;
  setIsAffiliate: (isAffiliate: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
