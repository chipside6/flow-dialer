
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserProfile } from './types';
import { fetchUserProfile } from './authUtils';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: Error | null;
  sessionChecked: boolean;
  setProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setIsAdmin(!!userProfile.is_admin);
          }
        } else {
          // No active session
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error instanceof Error ? error : new Error('Unknown error during session check'));
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Fetch profile data
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setIsAdmin(!!userProfile.is_admin);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
        setSessionChecked(true);
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    error,
    sessionChecked,
    setProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
