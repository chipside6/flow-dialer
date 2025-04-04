
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '../types';
import { clearAllAuthData } from '@/utils/sessionCleanup';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let authStateSubscription: { unsubscribe: () => void } | null = null;
    
    const initializeAuth = async () => {
      console.log("AuthSession: Checking for existing session");
      
      try {
        // First set up auth state change listener to catch any changes during initialization
        authStateSubscription = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) return;
            
            console.log('AuthSession: Auth state changed:', event);
            
            if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user as User);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          }
        ).data.subscription;
        
        // Check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError) {
          console.error('AuthSession: Error checking session:', sessionError);
          setError(sessionError);
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
          return;
        }
        
        if (sessionData.session?.user) {
          console.log("AuthSession: Found active session for user:", sessionData.session.user.email);
          setUser(sessionData.session.user as User);
        } else {
          console.log("AuthSession: No active session found");
          setUser(null);
        }
        
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
      } catch (error) {
        console.error('AuthSession: Error during initialization:', error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error('Unknown error during auth initialization'));
          setUser(null);
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
        }
      }
    };
    
    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && !initialized) {
        console.log("AuthSession: Timeout reached, forcing initialization");
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
      }
    }, 2000);
    
    initializeAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (authStateSubscription) {
        authStateSubscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // IMMEDIATELY clear all session state
      setUser(null);
      
      // Aggressively clear all storage before calling API
      clearAllAuthData();
      
      // Now attempt to clear server-side session
      try {
        // Sign out from Supabase directly
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Error during Supabase signout:", e);
      }
      
      // Force app reload to clear any remaining state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("AuthSession: Unexpected error during sign out:", error);
      
      // Force reload even on error
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
      return { success: true, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    sessionChecked,
    initialized,
    signOut
  };
}
