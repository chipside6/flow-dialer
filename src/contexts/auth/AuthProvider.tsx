
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserProfile } from './types';
import { fetchUserProfile } from './authUtils';
import { signOutUser } from './authActions';
import { toast } from '@/components/ui/use-toast';
import { ensureVoiceAppUploadsBucket } from '@/services/supabase/greetingFilesService';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("AuthProvider: Checking for existing session");
    
    let authStateChangeComplete = false;
    let sessionCheckComplete = false;
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!initialized) {
        console.log("AuthProvider: Timeout reached, forcing initialization");
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
      }
    }, 5000); // 5 second timeout
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event);
        authStateChangeComplete = true;
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Convert Supabase User to our User type
            const appUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at
            };
            
            setUser(appUser);
            
            // Ensure storage bucket exists
            await ensureVoiceAppUploadsBucket();
            
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
            
            // Removed automatic lifetime plan creation
          } catch (error) {
            console.error("AuthProvider: Error during sign in:", error);
            setError(error instanceof Error ? error : new Error('Unknown error during sign in'));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          
          toast({
            title: "Signed out", 
            description: "You have been signed out successfully"
          });
        }
        
        if (sessionCheckComplete) {
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
          clearTimeout(timeout);
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log("AuthProvider: Getting current session");
        
        // Get current user session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthProvider: Error checking session:', sessionError);
          setError(sessionError instanceof Error ? sessionError : new Error('Unknown error during session check'));
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
          return;
        }
        
        if (data.session?.user) {
          console.log("AuthProvider: Found active session for user:", data.session.user.email);
          
          try {
            // Convert Supabase User to our User type
            const appUser: User = {
              id: data.session.user.id,
              email: data.session.user.email || '',
              created_at: data.session.user.created_at,
              last_sign_in_at: data.session.user.last_sign_in_at
            };
            
            setUser(appUser);
            
            // Ensure storage bucket exists
            await ensureVoiceAppUploadsBucket();
            
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
            
            // Removed automatic lifetime plan creation
          } catch (profileError) {
            console.error("AuthProvider: Error fetching profile:", profileError);
          }
        } else {
          console.log("AuthProvider: No active session found");
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error checking session:', error);
        setError(error instanceof Error ? error : new Error('Unknown error during session check'));
      } finally {
        sessionCheckComplete = true;
        
        if (authStateChangeComplete) {
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
          clearTimeout(timeout);
        }
      }
    };
    
    checkSession();
    
    // Clean up
    return () => {
      clearTimeout(timeout);
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
    const result = await signOutUser();
    return result;
  };

  console.log("AuthProvider: Current state:", { 
    isAuthenticated: !!user, 
    isLoading, 
    initialized, 
    sessionChecked 
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
