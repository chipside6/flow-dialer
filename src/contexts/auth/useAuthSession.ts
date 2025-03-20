
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
  const [isAffiliate, setIsAffiliate] = useState(false);
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
          
          // Check roles
          setIsAffiliate(!!profileData.is_affiliate);
          setIsAdmin(!!profileData.is_admin);
        } else {
          console.log("useAuthSession - No profile found for user");
          setProfile(null);
          setIsAffiliate(false);
          setIsAdmin(false);
        }
      } else {
        console.log("useAuthSession - No user detected, clearing state");
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAffiliate(false);
        setIsAdmin(false);
      }
      
      setAuthError(null);
    } catch (error: any) {
      console.error('Error processing user session:', error);
      setAuthError(error);
      
      // Still mark as not loading, but with error state
      toast({
        title: "Authentication Error",
        description: "There was a problem checking your authentication status. Some features may be limited.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("useAuthSession - Auth state changed:", event);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in successfully", 
            description: "Welcome back!"
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out", 
            description: "You have been signed out successfully"
          });
        } else if (event === 'USER_UPDATED') {
          toast({
            title: "Account updated", 
            description: "Your account information has been updated"
          });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("useAuthSession - Token refreshed");
        }
        
        await processUserAndProfile(currentSession?.user || null, currentSession);
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      setIsLoading(true);
      try {
        console.log("useAuthSession - Checking active session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        await processUserAndProfile(session?.user || null, session);
      } catch (error: any) {
        console.error('Error checking auth session:', error);
        setAuthError(error);
        setIsLoading(false);
        setSessionChecked(true);
        
        toast({
          title: "Session Error",
          description: error.message || "There was a problem retrieving your session",
          variant: "destructive",
        });
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [processUserAndProfile]);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isAffiliate,
    authError,
    sessionChecked,
    setProfile,
    setIsAffiliate
  };
}
