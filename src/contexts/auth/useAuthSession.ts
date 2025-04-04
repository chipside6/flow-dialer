
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { debouncedClearAllAuthData } from '@/utils/sessionCleanup';
import { toast } from '@/components/ui/use-toast';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(false); // Changed to false by default
  const [initialized, setInitialized] = useState(false);
  const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(null);
  const [refreshError, setRefreshError] = useState<Error | null>(null);
  const [refreshInProgress, setRefreshInProgress] = useState(false);

  // Enhanced session refresh function with better error handling
  const refreshSession = useCallback(async (silent = false): Promise<boolean> => {
    // Prevent multiple simultaneous refresh attempts
    if (refreshInProgress) return false;
    
    try {
      setRefreshInProgress(true);
      console.log('Refreshing auth session...');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        
        // Only set refresh error for non-silent refreshes
        if (!silent) {
          setRefreshError(error);
          
          // Only show toast for actual auth errors, not network errors
          if (!error.message.includes('abort') && !error.message.includes('network')) {
            toast({
              title: "Session issue",
              description: "Please sign in again to continue",
              variant: "destructive"
            });
          }
        }
        
        return false;
      }
      
      if (data?.session) {
        // Set session and user state
        setSession(data.session);
        setUser(data.session.user);
        
        // Calculate and store session expiry time
        const expiresAt = data.session.expires_at;
        if (expiresAt) {
          // Convert to milliseconds
          const expiryTime = expiresAt * 1000;
          setSessionExpiryTime(expiryTime);
          
          // Cache the session last updated time
          localStorage.setItem('sessionLastUpdated', Date.now().toString());
        }
        
        return true;
      } else {
        // If no session, clear state
        setSession(null);
        setUser(null);
        setSessionExpiryTime(null);
        
        // Don't show toast for silent refreshes or initialization
        if (!silent && initialized) {
          toast({
            title: "Session expired",
            description: "Please sign in again to continue.",
            variant: "destructive"
          });
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
      
      // Only set refresh error for non-silent refreshes
      if (!silent) {
        setRefreshError(error instanceof Error ? error : new Error(String(error)));
      }
      
      return false;
    } finally {
      setRefreshInProgress(false);
      setIsLoading(false);
      setInitialized(true);
    }
  }, [initialized, refreshInProgress]);

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
  }, [refreshSession]);

  // Get the time remaining in the current session
  const getSessionTimeRemaining = useCallback((): number => {
    if (!sessionExpiryTime) return 0;
    const now = Date.now();
    return Math.max(0, sessionExpiryTime - now);
  }, [sessionExpiryTime]);

  // Check if session is about to expire
  const isSessionAboutToExpire = useCallback((): boolean => {
    const timeRemaining = getSessionTimeRemaining();
    // Return true if less than 10 minutes remaining
    return timeRemaining > 0 && timeRemaining < 10 * 60 * 1000;
  }, [getSessionTimeRemaining]);

  return {
    session,
    user,
    loading,
    initialized,
    refreshSession,
    refreshError,
    getSessionTimeRemaining,
    isSessionAboutToExpire
  };
};
