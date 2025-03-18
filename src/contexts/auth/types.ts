
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  is_admin: boolean | null;
  is_affiliate: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  setAsAffiliate?: (userId: string) => Promise<void>;
}
