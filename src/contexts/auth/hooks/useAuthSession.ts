
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debouncedClearAllAuthData } from '@/utils/sessionCleanup';
import { useAuthState } from './useAuthState';
import { useSessionManagement } from './useSessionManagement';

export const useAuthSession = () => {
  const { 
    user, setUser, 
    loading, setIsLoading, 
    initialized, setInitialized 
  } = useAuthState();
  
  const { 
    session, setSession, 
    sessionExpiryTime, setSessionExpiryTime,
    refreshSession, refreshError,
    getSessionTimeRemaining, isSessionAboutToExpire 
  } = useSessionManagement();
  
  // Provide signOut functionality
  const signOut = useCallback(async (): Promise<{ success: boolean; error: Error | null }> => {
    try {
      // Clear user state
      setUser(null);
      setSession(null);
      setSessionExpiryTime(null);
      
      // Clear localStorage
      debouncedClearAllAuthData();
      
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
  }, [setUser, setSession, setSessionExpiryTime]);

  // Check session expiry and refresh if needed
  useEffect(() => {
    // Setup session refresh before expiry
    if (sessionExpiryTime) {
      const now = Date.now();
      const timeUntilExpiry = sessionExpiryTime - now;
      
      // If session is expired or will expire in less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        refreshSession(true);
      } else {
        // Schedule refresh for 5 minutes before expiry
        const refreshTime = timeUntilExpiry - 5 * 60 * 1000;
        const refreshTimer = setTimeout(() => {
          refreshSession(true);
        }, refreshTime);
        
        return () => clearTimeout(refreshTimer);
      }
    }
  }, [sessionExpiryTime, refreshSession]);

  // Initial session fetch
  useEffect(() => {
    const fetchInitialSession = async () => {
      await refreshSession(true);
    };
    
    fetchInitialSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          setSessionExpiryTime(session?.expires_at ? session.expires_at * 1000 : null);
          setInitialized(true);
          
          // Update the session last updated time
          localStorage.setItem('sessionLastUpdated', Date.now().toString());
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setSessionExpiryTime(null);
          debouncedClearAllAuthData();
        } else if (event === 'USER_UPDATED') {
          // Simply update the session without full reset
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [refreshSession, setInitialized, setIsLoading, setSession, setSessionExpiryTime, setUser]);

  return {
    session,
    user,
    loading,
    isLoading: loading, // Alias for compatibility
    initialized,
    refreshSession,
    refreshError,
    error: refreshError, // Alias for compatibility
    sessionChecked: initialized, // Alias for compatibility
    signOut,
    getSessionTimeRemaining,
    isSessionAboutToExpire
  };
};
