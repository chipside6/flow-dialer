
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserProfile } from '../types';
import { fetchUserProfile } from '../authUtils';
import { ensureVoiceAppUploadsBucket } from '@/services/supabase/greetingFilesService';
import { clearAllAuthData } from '@/utils/sessionCleanup';

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  // Handler for updating the profile
  const updateProfile = (newProfile: UserProfile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      setIsAdmin(!!newProfile.is_admin);
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
    console.log("AuthProvider: Checking for existing session");
    
    let isMounted = true;
    let authStateChangeComplete = false;
    let sessionCheckComplete = false;
    
    // Set a timeout to prevent infinite loading - REDUCED from 5s to 2s
    const timeout = setTimeout(() => {
      if (isMounted && !initialized) {
        console.log("AuthProvider: Timeout reached, forcing initialization");
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
      }
    }, 2000); // 2 second timeout (reduced from 3)
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('AuthProvider: Auth state changed:', event);
        authStateChangeComplete = true;
        
        if (event === 'SIGNED_IN' && session?.user) {
          await handleSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        if (sessionCheckComplete && isMounted) {
          setIsLoading(false);
          setSessionChecked(true);
          setInitialized(true);
          clearTimeout(timeout);
        }
      }
    );
    
    // Helper function to handle user sign in
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
        
        // Fetch profile data
        const userProfile = await fetchUserProfile(supabaseUser.id);
        console.log("AuthProvider: Fetched user profile:", userProfile);
        if (userProfile) {
          // Make sure to set the email from the auth user
          const updatedProfile = {
            ...userProfile,
            email: supabaseUser.email || ''
          };
          setProfile(updatedProfile);
          
          // Explicitly convert to boolean to avoid null
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
        
      } catch (error) {
        console.error("AuthProvider: Error during sign in:", error);
        setError(error instanceof Error ? error : new Error('Unknown error during sign in'));
        setIsAdmin(false); // Default to non-admin on error
      }
    };
    
    // THEN check for existing session - with a fallback timeout
    const checkSession = async () => {
      try {
        // Add timeout for getting session - REDUCED from 2.5s to 1.5s
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 1500)
        );
        
        const { data, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (!isMounted) return;
        
        console.log("AuthProvider: Getting current session");
        
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
          await handleSignIn(data.session.user);
        } else {
          console.log("AuthProvider: No active session found");
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error checking session:', error);
        setError(error instanceof Error ? error : new Error('Unknown error during session check'));
        setIsAdmin(false); // Default to non-admin on error
        
        // IMPORTANT: On session check error, we need to clear state
        setUser(null);
        setProfile(null);
      } finally {
        if (isMounted) {
          sessionCheckComplete = true;
          
          if (authStateChangeComplete) {
            setIsLoading(false);
            setSessionChecked(true);
            setInitialized(true);
            clearTimeout(timeout);
          }
        }
      }
    };
    
    checkSession();
    
    // Clean up
    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
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
