
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

export const useSessionManagement = () => {
  const [session, setSession] = useState<Session | null>(null);
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
        // Set session state
        setSession(data.session);
        
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
        setSessionExpiryTime(null);
        
        // Don't show toast for silent refreshes
        if (!silent && !refreshInProgress) {
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
    }
  }, [refreshInProgress]);

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
    sessionExpiryTime,
    refreshSession,
    refreshError,
    refreshInProgress,
    setSession,
    setSessionExpiryTime,
    getSessionTimeRemaining,
    isSessionAboutToExpire
  };
};
