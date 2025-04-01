
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserProfile } from './types';
import { fetchUserProfile } from './authUtils';
import { signOutUser } from './authActions';

console.log('🔍 AuthProvider.tsx is being imported');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔍 AuthProvider component initializing');
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("🔍 AuthProvider: Setting up auth state");
    
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔍 AuthProvider: Auth state changed:', event);
        
        if (session?.user) {
          try {
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
            } else {
              // Set isAdmin to false when no profile is found
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("🔍 AuthProvider: Error during sign in:", error);
            setError(error instanceof Error ? error : new Error('Unknown error during sign in'));
            setIsAdmin(false); // Default to non-admin on error
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        if (isMounted) {
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        if (!isMounted) return;
        
        console.log("🔍 AuthProvider: Getting current session");
        
        // Get current user session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('🔍 AuthProvider: Error checking session:', sessionError);
          setError(sessionError instanceof Error ? sessionError : new Error('Unknown error during session check'));
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
          return;
        }
        
        if (data.session?.user) {
          console.log("🔍 AuthProvider: Found active session for user:", data.session.user.email);
          
          try {
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
            } else {
              // Set isAdmin to false when no profile is found
              setIsAdmin(false);
            }
          } catch (profileError) {
            console.error("🔍 AuthProvider: Error fetching profile:", profileError);
            setIsAdmin(false); // Default to non-admin on error
          }
        } else {
          console.log("🔍 AuthProvider: No active session found");
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('🔍 AuthProvider: Error checking session:', error);
        setError(error instanceof Error ? error : new Error('Unknown error during session check'));
        setIsAdmin(false); // Default to non-admin on error
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
        }
      }
    };
    
    checkSession();
    
    // Clean up
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handler for updating the profile
  const updateProfile = (newProfile: UserProfile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      setIsAdmin(!!newProfile.is_admin);
    } else {
      setIsAdmin(false);
    }
  };
  
  // Handler for signing out
  const signOut = async () => {
    try {
      console.log('🔍 AuthProvider: Signing out user');
      setIsLoading(true);
      
      // Immediately reset state for better UX
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      const result = await signOutUser();
      
      if (!result.success) {
        console.error("🔍 AuthProvider: Error during sign out:", result.error);
      }
      
      return result;
    } catch (error) {
      console.error("🔍 AuthProvider: Unexpected error during sign out:", error);
      return { success: true, error };
    } finally {
      setIsLoading(false);
    }
  };

  console.log("🔍 AuthProvider: Current state:", { 
    isAuthenticated: !!user, 
    isLoading, 
    initialized, 
    sessionChecked,
    isAdmin
  });

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

console.log('🔍 AuthProvider.tsx has been loaded');
