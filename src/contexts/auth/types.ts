
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_admin?: boolean;
  is_affiliate?: boolean;
  email?: string;
  company_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
  initialized: boolean;
  sessionChecked: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ success: boolean; error: any } | void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  setAsAffiliate: (userId: string) => Promise<void>;
}
