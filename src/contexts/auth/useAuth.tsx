
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
  signOut: () => Promise<{ success: boolean, error: Error | null }>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(true); // Set to true by default

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        setUser(data.session.user);
        
        // Fetch profile data
        const userProfile = await fetchUserProfile(data.session.user.id);
        if (userProfile) {
          setProfile(userProfile);
          setIsAdmin(!!userProfile.is_admin);
        }
      }
      
      setIsLoading(false);
    };
    
    getSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Clear user state immediately
      setUser(null);
      setProfile(null);
      
      // Simple cleanup
      localStorage.removeItem('sessionLastUpdated');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error during sign out:", error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    error,
    sessionChecked,
    setProfile,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
