
import type { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAffiliate: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  setAsAffiliate: (userId: string) => Promise<void>;
}

// Define the profile interface
export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
  is_affiliate: boolean;
  is_admin: boolean;
}
