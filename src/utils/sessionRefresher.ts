
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { refreshSession, clearSession, isSessionValid } from '@/services/auth/session';

// Track refresh attempts to avoid infinite loops
let refreshAttempts = 0;
let lastRefreshTime = 0;
const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_COOLDOWN = 60000; // 1 minute cooldown between retries

/**
 * Refreshes the user session with Supabase and updates local storage
 * Returns true if successful, false if failed
 */
export const refreshUserSession = async (silent = false): Promise<boolean> => {
  const now = Date.now();
  
  // Check if we're in cooldown period
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    console.log("Session refresh in cooldown period, skipping");
    return isSessionValid(); // Return current validity state
  }
  
  // Check if we've exceeded max attempts
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.warn("Maximum session refresh attempts reached");
    if (!silent) {
      toast({
        title: "Authentication issue",
        description: "Unable to refresh your session. Please try logging in again.",
        variant: "destructive"
      });
    }
    return false;
  }
  
  // Update counters
  refreshAttempts++;
  lastRefreshTime = now;
  
  try {
    console.log("Attempting to refresh user session...");
    
    // Try to refresh the session with Supabase
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Error refreshing session:", error);
      if (!silent) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
      }
      return false;
    }
    
    if (data.session) {
      // Update local session storage with new expiry time
      refreshSession(data.session.expires_at);
      
      // Reset refresh attempts on success
      refreshAttempts = 0;
      
      console.log("Session successfully refreshed, expires at:", 
        new Date(data.session.expires_at * 1000).toLocaleString());
      
      return true;
    } else {
      console.warn("No session returned from refresh attempt");
      return false;
    }
  } catch (error) {
    console.error("Exception during session refresh:", error);
    return false;
  }
};

/**
 * Reset the refresh attempt counter
 */
export const resetRefreshAttempts = () => {
  refreshAttempts = 0;
};

/**
 * Sets up periodic session refreshing
 * Call this on app initialization
 */
export const initializeSessionRefresher = () => {
  // Reset attempts counter
  resetRefreshAttempts();
  
  // Set up interval to check and refresh session
  const intervalId = setInterval(async () => {
    // Only attempt refresh if we have a valid session to start with
    if (isSessionValid()) {
      // Get remaining time in session
      const { data } = await supabase.auth.getSession();
      
      // If session exists and expires in less than 10 minutes, refresh it
      if (data.session) {
        const expiresAt = data.session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = expiresAt - now;
        
        // Refresh if less than 10 minutes remaining
        if (timeRemaining < 600) {
          console.log(`Session expires in ${timeRemaining} seconds, refreshing...`);
          await refreshUserSession(true);
        }
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
  
  // Return function to clear interval if needed
  return () => clearInterval(intervalId);
};

/**
 * Run a function with automatic session refresh on auth errors
 * @param fn Function to run that returns a promise
 * @returns Result of the function or throws an error
 */
export const withSessionRefresh = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    // First attempt
    return await fn();
  } catch (error: any) {
    // Check if it's an auth error
    if (error?.status === 401 || error?.status === 403 || 
        error?.message?.includes('unauthorized') || error?.message?.includes('auth')) {
      
      console.log("Detected auth error, attempting session refresh...");
      
      // Try to refresh the session
      const refreshed = await refreshUserSession(true);
      
      if (refreshed) {
        // Retry the function after successful refresh
        console.log("Session refreshed, retrying operation...");
        return await fn();
      } else {
        // Refresh failed
        throw new Error("Session expired and refresh failed");
      }
    }
    
    // Not an auth error or refresh failed, rethrow
    throw error;
  }
};
