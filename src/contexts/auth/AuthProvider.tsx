
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserProfile } from './types';
import { fetchUserProfile } from './authUtils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    console.log("Checking for existing session");
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Fetch profile data
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setIsAdmin(!!userProfile.is_admin);
            setIsAffiliate(!!userProfile.is_affiliate);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsAffiliate(false);
        }
        
        setIsLoading(false);
        setSessionChecked(true);
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Get current user session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError);
          setError(sessionError instanceof Error ? sessionError : new Error('Unknown error during session check'));
          setIsLoading(false);
          setSessionChecked(true);
          return;
        }
        
        if (data.session?.user) {
          console.log("Found active session for user:", data.session.user.email);
          setUser(data.session.user);
          
          // Fetch user profile
          const userProfile = await fetchUserProfile(data.session.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setIsAdmin(!!userProfile.is_admin);
            setIsAffiliate(!!userProfile.is_affiliate);
          }
        } else {
          console.log("No active session found");
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsAffiliate(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error instanceof Error ? error : new Error('Unknown error during session check'));
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
      }
    };
    
    checkSession();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handler for updating the profile
  const updateProfile = (newProfile: UserProfile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      setIsAdmin(!!newProfile.is_admin);
      setIsAffiliate(!!newProfile.is_affiliate);
    }
  };
  
  // Handler for updating affiliate status
  const updateIsAffiliate = (status: boolean) => {
    setIsAffiliate(status);
    if (profile) {
      setProfile({
        ...profile,
        is_affiliate: status
      });
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isAffiliate,
    error,
    sessionChecked,
    setProfile: updateProfile,
    setIsAffiliate: updateIsAffiliate
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
