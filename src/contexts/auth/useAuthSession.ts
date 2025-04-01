
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { UserProfile } from './types';
import { fetchUserProfile } from './authUtils';
import { toast } from '@/components/ui/use-toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const { isOnline } = useNetworkStatus();
  
  // Use a ref to track mounted state
  const isMounted = useRef(true);
  // Track session subscriptions to prevent memory leaks
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  // Track timeout IDs for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to process user and profile data - optimized with debouncing
  const processUserAndProfile = useCallback(async (sessionUser: User | null, currentSession: Session | null) => {
    if (!isMounted.current) return;
    
    try {
      if (sessionUser) {
        console.log("useAuthSession - Processing user:", sessionUser.email);
        
        // Set user and session immediately for better UX
        setUser(sessionUser);
        setSession(currentSession);

        // Defer profile fetching to avoid blocking the main thread
        setTimeout(async () => {
          if (!isMounted.current) return;
          
          try {
            // Fetch user profile
            const profileData = await fetchUserProfile(sessionUser.id);
            
            if (profileData && isMounted.current) {
              console.log("useAuthSession - Profile data:", profileData);
              setProfile(profileData);
              
              // Check admin role
              setIsAdmin(!!profileData.is_admin);
            } else if (isMounted.current) {
              console.log("useAuthSession - No profile found for user");
              setProfile(null);
              setIsAdmin(false);
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
            if (isMounted.current) {
              setProfile(null);
              setIsAdmin(false);
            }
          }
        }, 0);
      } else {
        console.log("useAuthSession - No user detected, clearing state");
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
      }
      
      if (isMounted.current) {
        setAuthError(null);
        setIsLoading(false);
        setSessionChecked(true);
      }
    } catch (error: any) {
      console.error('Error processing user session:', error);
      if (isMounted.current) {
        setAuthError(error);
        setIsLoading(false);
        setSessionChecked(true);
      }
    }
  }, []);

  // Function to clear session data
  const clearSessionData = useCallback(() => {
    if (!isMounted.current) return;
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsLoading(false);
    setSessionChecked(true);
  }, []);

  // Setup auth state listener - optimized with proper cleanup and network awareness
  useEffect(() => {
    // Reset isMounted ref on mount
    isMounted.current = true;
    
    // Create a promise that resolves after timeout to prevent UI from getting stuck
    const setupTimeoutPromise = () => {
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current && isLoading) {
          console.log("useAuthSession - Timeout reached while waiting for session");
          setIsLoading(false);
          setSessionChecked(true);
        }
      }, 2000); // Shorter timeout for better UX
    };
    
    // Set up auth state change listener FIRST to catch all events
    const setupAuthListener = () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (!isMounted.current) return;
          
          console.log("useAuthSession - Auth state changed:", event);
          
          if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !currentSession)) {
            clearSessionData();
            
            if (event === 'SIGNED_OUT') {
              toast({
                title: "Signed out", 
                description: "You have been signed out successfully"
              });
            }
            return;
          }
          
          // Handle other auth events - use non-blocking approach
          if (currentSession?.user) {
            // Process synchronously, but defer network calls
            processUserAndProfile(currentSession?.user || null, currentSession);
          }
        }
      );
      
      subscriptionRef.current = subscription;
    };
    
    // Check for existing session - with network and timeout awareness
    const checkSession = async () => {
      if (!isMounted.current) return;
      
      try {
        console.log("useAuthSession - Checking active session");
        
        // Race between session fetch and timeout
        const sessionPromise = supabase.auth.getSession();
        setupTimeoutPromise();
        
        const { data: { session }, error } = await sessionPromise;
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        if (error) {
          console.error("Session check error:", error);
          if (isMounted.current) {
            setAuthError(error);
            setIsLoading(false);
            setSessionChecked(true);
          }
          return;
        }
        
        if (isMounted.current) {
          // Check if the session is valid by looking at its expiry time
          if (session) {
            const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
            const now = new Date();
            
            if (expiresAt && expiresAt < now) {
              console.log("useAuthSession - Session has expired, clearing session data");
              clearSessionData();
              return;
            }
          }
          
          await processUserAndProfile(session?.user || null, session);
        }
      } catch (error: any) {
        if (!isMounted.current) return;
        
        console.error('Error checking auth session:', error);
        setAuthError(error);
        setIsLoading(false);
        setSessionChecked(true);
      }
    };
    
    // Main initialization with ordered execution
    setupAuthListener();
    checkSession();
    
    // Periodic session check with network awareness
    const periodicCheckInterval = setInterval(() => {
      if (!isOnline) {
        // Skip periodic check when offline
        return;
      }
      
      if (session) {
        const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
        const now = new Date();
        
        if (expiresAt && expiresAt < now) {
          console.log("useAuthSession - Session expired during interval check");
          clearSessionData();
        }
      }
    }, 60000); // Check every minute

    // Comprehensive cleanup
    return () => {
      isMounted.current = false;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      clearInterval(periodicCheckInterval);
    };
  }, [processUserAndProfile, clearSessionData, isOnline]);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    authError,
    sessionChecked,
    setProfile
  };
}
