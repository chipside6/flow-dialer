
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

  // Simple one-time session check on mount
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      
      try {
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
      } catch (error) {
        console.error("Auth session check error:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
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
      // Clear user state
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Clear localStorage
      localStorage.removeItem('isAuthenticated');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error during sign out:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    error,
    setProfile,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
