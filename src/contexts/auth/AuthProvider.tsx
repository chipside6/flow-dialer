
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User } from './types';
import { clearAllAuthData } from '@/utils/sessionCleanup';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          setUser(data.session.user);
          
          // Simple admin check
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .single();
            
          setIsAdmin(!!profileData?.is_admin);
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
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Simple admin check
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(!!profileData?.is_admin);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          clearAllAuthData();
        }
        
        setIsLoading(false);
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
      setIsAdmin(false);
      clearAllAuthData();
      
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
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    error,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
