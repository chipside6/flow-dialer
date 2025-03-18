
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { UserProfile } from './types';
import { fetchUserProfile } from './authUtils';
import { toast } from '@/components/ui/use-toast';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Function to process user and profile data
  const processUserAndProfile = useCallback(async (sessionUser: User | null) => {
    try {
      if (sessionUser) {
        console.log("useAuthSession - Processing user:", sessionUser.email);
        setUser(sessionUser);

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
    }
  }, []);

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        console.log("useAuthSession - Checking active session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        await processUserAndProfile(session?.user || null);
      } catch (error: any) {
        console.error('Error checking auth session:', error);
        setAuthError(error);
        setIsLoading(false);
        
        toast({
          title: "Session Error",
          description: error.message || "There was a problem retrieving your session",
          variant: "destructive",
        });
      }
    };

    let subscription: { data: { subscription: { unsubscribe: () => void } } };

    const setupSubscription = async () => {
      // Subscribe to auth changes
      subscription = supabase.auth.onAuthStateChange(
        async (event, session) => {
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
          }
          
          await processUserAndProfile(session?.user || null);
        }
      );
    };

    checkSession();
    setupSubscription();

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.data.subscription.unsubscribe();
      }
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
    setProfile,
    setIsAffiliate
  };
}
