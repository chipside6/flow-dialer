
import React, { createContext } from 'react';
import { User, UserProfile, Session } from './types';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
  initialized: boolean;
  sessionChecked: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null, session?: Session }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null, session?: Session }>;
  signOut: () => Promise<{ success: boolean; error: any } | void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  setAsAffiliate: (userId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}
