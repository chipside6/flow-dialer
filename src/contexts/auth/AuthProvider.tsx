
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserProfile } from './types';
import { fetchUserProfile } from './authUtils';
import { signOutUser } from './authActions';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("Checking for existing session");
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Convert Supabase User to our User type
          const appUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          };
          
          setUser(appUser);
          
          // Fetch profile data
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            // Make sure to set the email from the auth user
            const updatedProfile = {
              ...userProfile,
              email: session.user.email || ''
            };
            setProfile(updatedProfile);
            setIsAdmin(!!updatedProfile.is_admin);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
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
          setInitialized(true);
          return;
        }
        
        if (data.session?.user) {
          console.log("Found active session for user:", data.session.user.email);
          
          // Convert Supabase User to our User type
          const appUser: User = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            created_at: data.session.user.created_at,
            last_sign_in_at: data.session.user.last_sign_in_at
          };
          
          setUser(appUser);
          
          // Fetch user profile
          const userProfile = await fetchUserProfile(data.session.user.id);
          if (userProfile) {
            // Make sure to set the email from the auth user
            const updatedProfile = {
              ...userProfile,
              email: data.session.user.email || ''
            };
            setProfile(updatedProfile);
            setIsAdmin(!!updatedProfile.is_admin);
          }
        } else {
          console.log("No active session found");
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error instanceof Error ? error : new Error('Unknown error during session check'));
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
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
    }
  };
  
  // Handler for signing out
  const signOut = async () => {
    return await signOutUser();
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    error,
    sessionChecked,
    initialized,
    setProfile: updateProfile,
    updateProfile,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
