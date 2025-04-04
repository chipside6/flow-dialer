import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserProfile } from '../types';
import { fetchUserProfile } from '../authUtils';
import { ensureVoiceAppUploadsBucket } from '@/services/supabase/greetingFilesService';
import { clearAllAuthData } from '@/utils/sessionCleanup';

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Helper function to activate trial plan for new users
  const activateTrialForNewUser = async (userId: string) => {
    // This functionality is moved to a separate file
    const { activateTrialPlan } = await import('./useTrialActivation');
    return activateTrialPlan(userId);
  };

  // Handler for updating the profile with improved admin handling
  const updateProfile = (newProfile: UserProfile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      // Explicitly convert is_admin to boolean to avoid type issues
      const adminFlag = newProfile.is_admin === true;
      setIsAdmin(adminFlag);
      console.log("AuthProvider: Updated isAdmin flag to:", adminFlag);
    } else {
      setIsAdmin(false);
    }
  };

  // Improved signOut function with immediate state reset
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // IMMEDIATELY clear all session state
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Aggressively clear all storage before calling API
      clearAllAuthData();
      
      // Now attempt to clear server-side session
      try {
        // Sign out from Supabase directly
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Error during Supabase signout:", e);
      }
      
      // Force app reload to clear any remaining state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("AuthProvider: Unexpected error during sign out:", error);
      
      // Force reload even on error
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
      return { success: true, error };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let authStateSubscription: { unsubscribe: () => void } | null = null;
    
    const initializeAuth = async () => {
      console.log("AuthProvider: Checking for existing session");
      
      try {
        // First set up auth state change listener to catch any changes during initialization
        authStateSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            console.log('AuthProvider: Auth state changed:', event);
            
            if (event === 'SIGNED_IN' && session?.user) {
              await handleSignIn(session.user);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
              setIsAdmin(false);
            }
          }
        ).data.subscription;
        
        // Check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError) {
          console.error('AuthProvider: Error checking session:', sessionError);
          setError(sessionError);
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
          return;
        }
        
        if (sessionData.session?.user) {
          console.log("AuthProvider: Found active session for user:", sessionData.session.user.email);
          await handleSignIn(sessionData.session.user);
        } else {
          console.log("AuthProvider: No active session found");
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false); // Make sure to set loading to false when no session
        }
        
        if (isMounted) {
          setSessionChecked(true);
          setInitialized(true);
        }
      } catch (error) {
        console.error('AuthProvider: Error during initialization:', error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error('Unknown error during auth initialization'));
          setIsAdmin(false);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
        }
      }
    };
    
    // Helper function to handle user sign in with improved admin flag handling
    const handleSignIn = async (supabaseUser: any) => {
      try {
        // Convert Supabase User to our User type
        const appUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          created_at: supabaseUser.created_at,
          last_sign_in_at: supabaseUser.last_sign_in_at
        };
        
        setUser(appUser);
        
        // Check bucket existence but don't block on failure
        try {
          await ensureVoiceAppUploadsBucket();
        } catch (bucketError) {
          console.warn('Could not verify storage bucket, but continuing:', bucketError);
          // Don't block the auth flow for storage issues
        }
        
        // Fetch profile data with admin status
        const userProfile = await fetchUserProfile(supabaseUser.id);
        console.log("AuthProvider: Fetched user profile:", userProfile);
        
        if (userProfile) {
          // Make sure to set the email from the auth user
          const updatedProfile = {
            ...userProfile,
            email: supabaseUser.email || ''
          };
          setProfile(updatedProfile);
          
          // Explicitly convert is_admin to boolean to prevent type issues
          const isAdminFlag = updatedProfile.is_admin === true;
          setIsAdmin(isAdminFlag);
          console.log("AuthProvider: Set isAdmin flag to:", isAdminFlag);
        } else {
          // Set isAdmin to false when no profile is found
          console.log("AuthProvider: No profile found, setting isAdmin to false");
          setIsAdmin(false);
        }
        
        // Activate trial plan for new user using setTimeout to prevent blocking
        setTimeout(() => {
          activateTrialForNewUser(supabaseUser.id);
        }, 0);
        
        setIsLoading(false); // Set loading to false after everything is loaded
        
      } catch (error) {
        console.error("AuthProvider: Error during sign in:", error);
        setError(error instanceof Error ? error : new Error('Unknown error during sign in'));
        setIsAdmin(false); // Default to non-admin on error
        setIsLoading(false); // Set loading to false on error
      }
    };
    
    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && !initialized) {
        console.log("AuthProvider: Timeout reached, forcing initialization");
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
      }
    }, 2000);
    
    initializeAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (authStateSubscription) {
        authStateSubscription.unsubscribe();
      }
    };
  }, []);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    error,
    sessionChecked,
    initialized,
    updateProfile,
    signOut
  };
}
