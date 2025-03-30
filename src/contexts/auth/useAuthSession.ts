
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { UserProfile } from './types';
import { fetchUserProfile } from './authUtils';
import { toast } from '@/components/ui/use-toast';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Function to process user and profile data
  const processUserAndProfile = useCallback(async (sessionUser: User | null, currentSession: Session | null) => {
    try {
      if (sessionUser) {
        console.log("useAuthSession - Processing user:", sessionUser.email);
        setUser(sessionUser);
        setSession(currentSession);

        // Fetch user profile
        const profileData = await fetchUserProfile(sessionUser.id);
        
        if (profileData) {
          console.log("useAuthSession - Profile data:", profileData);
          setProfile(profileData);
          
          // Check admin role
          setIsAdmin(!!profileData.is_admin);
        } else {
          console.log("useAuthSession - No profile found for user");
          setProfile(null);
          setIsAdmin(false);
        }
      } else {
        console.log("useAuthSession - No user detected, clearing state");
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
      }
      
      setAuthError(null);
    } catch (error: any) {
      console.error('Error processing user session:', error);
      setAuthError(error);
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
    }
  }, []);

  // Function to clear session data
  const clearSessionData = useCallback(() => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsLoading(false);
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Create a promise that resolves after the timeout to prevent UI from getting stuck
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        if (isMounted && isLoading) {
          console.log("useAuthSession - Timeout reached while waiting for session");
          resolve();
        }
      }, 2500); // Shorter timeout to ensure UI responsiveness
    });
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        
        console.log("useAuthSession - Auth state changed:", event);
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !currentSession) {
          clearSessionData();
          
          if (event === 'SIGNED_OUT') {
            toast({
              title: "Signed out", 
              description: "You have been signed out successfully"
            });
          }
          return;
        }
        
        try {
          await processUserAndProfile(currentSession?.user || null, currentSession);
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          if (isMounted) {
            setIsLoading(false);
            setSessionChecked(true);
          }
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        console.log("useAuthSession - Checking active session");
        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise.then(() => ({ data: { session: null }, error: new Error("Session check timed out") }))
        ]);
        
        if (error) {
          console.error("Session check error:", error);
          if (isMounted) {
            setAuthError(error);
            setIsLoading(false);
            setSessionChecked(true);
          }
          return;
        }
        
        if (isMounted) {
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
        if (!isMounted) return;
        
        console.error('Error checking auth session:', error);
        setAuthError(error);
        setIsLoading(false);
        setSessionChecked(true);
      }
    };

    checkSession();

    // Periodic session check to handle expiry
    const intervalId = setInterval(() => {
      if (session) {
        const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
        const now = new Date();
        
        if (expiresAt && expiresAt < now) {
          console.log("useAuthSession - Session expired during interval check");
          clearSessionData();
        }
      }
    }, 60000); // Check every minute

    // Clean up
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      subscription.unsubscribe();
    };
  }, [processUserAndProfile, clearSessionData]);

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
