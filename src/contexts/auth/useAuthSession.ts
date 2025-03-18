
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { UserProfile } from './types';
import { fetchUserProfile } from './authUtils';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to process user and profile data
  const processUserAndProfile = async (sessionUser: User | null) => {
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

    setIsLoading(false);
  };

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        console.log("useAuthSession - Checking active session");
        const { data: { session } } = await supabase.auth.getSession();
        
        await processUserAndProfile(session?.user || null);
      } catch (error) {
        console.error('Error checking auth session:', error);
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("useAuthSession - Auth state changed:", event);
        await processUserAndProfile(session?.user || null);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isAffiliate,
    setProfile,
    setIsAffiliate
  };
}
