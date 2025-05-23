import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User } from './types';
import { clearAllAuthData } from '@/utils/sessionCleanup';
import { toast } from '@/components/ui/use-toast';
import { 
  getStoredSession, 
  storeSession, 
  clearSession, 
  storeAdminStatus,
  getStoredAdminStatus,
  touchSession 
} from '@/services/auth/session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionCheckInProgress, setSessionCheckInProgress] = useState(false);

  // Function to validate a session
  const validateSession = useCallback(async (silent = false) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error validating session:", error);
        if (!silent) {
          setError(error);
        }
        return false;
      }
      
      if (!data.session) {
        if (!silent) {
          console.log("No valid session found");
        }
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Exception validating session:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    // Touch session to keep it active
    touchSession();
    
    // Set up interval to touch session periodically
    const intervalId = setInterval(() => {
      touchSession();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Initial session and auth state check
  useEffect(() => {
    // Check for existing session on mount
    const getSession = async () => {
      // Prevent multiple simultaneous session checks
      if (sessionCheckInProgress) return;
      
      setSessionCheckInProgress(true);
      try {
        // First check for stored admin status to set initial state
        const storedAdminStatus = getStoredAdminStatus();
        if (storedAdminStatus !== null) {
          console.log("Found stored admin status:", storedAdminStatus);
          setIsAdmin(storedAdminStatus);
        }
        
        // Check local storage for cached session
        const storedSession = getStoredSession();
        
        if (storedSession?.user) {
          console.log("Found stored session, using it for initial state");
          setUser(storedSession.user);
          
          // Verify session with Supabase
          const isValid = await validateSession(true);
          
          if (!isValid) {
            console.warn("Stored session invalid, clearing it");
            clearSession();
            setUser(null);
          } else {
            // Session is valid, try to fetch profile information
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', storedSession.user.id)
                .maybeSingle();
                
              if (profileData) {
                setProfile(profileData);
                setIsAdmin(!!profileData.is_admin);
                // Store admin status for persistence
                storeAdminStatus(!!profileData.is_admin);
              }
            } catch (profileError) {
              console.error("Error fetching profile:", profileError);
            }
          }
        } else {
          // No stored session, check with Supabase directly
          const { data } = await supabase.auth.getSession();
          
          if (data.session?.user) {
            // Convert Supabase User to our User type
            const userData: User = {
              id: data.session.user.id,
              email: data.session.user.email || '',
              created_at: data.session.user.created_at,
              last_sign_in_at: data.session.user.last_sign_in_at
            };
            setUser(userData);
            
            // Store session for later use
            storeSession({
              user: userData,
              token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at
            });
            
            // Simple admin check
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.session.user.id)
                .maybeSingle();
                
              if (profileData) {
                setProfile(profileData);
                setIsAdmin(!!profileData.is_admin);
                // Store admin status for persistence
                storeAdminStatus(!!profileData.is_admin);
              }
            } catch (profileError) {
              console.error("Error fetching profile:", profileError);
            }
          }
        }
      } catch (error) {
        console.error("Auth session check error:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        // Don't clear session on errors to prevent unwanted logouts
      } finally {
        setIsLoading(false);
        setInitialized(true);
        setSessionChecked(true);
        setSessionCheckInProgress(false);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Convert Supabase User to our User type
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          };
          setUser(userData);
          
          // Store session for future use
          storeSession({
            user: userData,
            token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          });
          
          // Fetch user profile
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
              
            if (profileData) {
              setProfile(profileData);
              setIsAdmin(!!profileData.is_admin);
              // Store admin status for persistence
              storeAdminStatus(!!profileData.is_admin);
            }
          } catch (profileError) {
            console.error("Error fetching profile on sign in:", profileError);
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("Token refreshed, updating stored session");
          
          // Only update the token-related information to avoid overwriting user data
          const storedSession = getStoredSession();
          if (storedSession) {
            storeSession({
              ...storedSession,
              token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          clearSession();
        }
        
        setIsLoading(false);
        setInitialized(true);
        setSessionChecked(true);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [validateSession]);

  // Enhanced sign out function with immediate token clearing
  const signOut = async () => {
    try {
      console.log("Signing out user");
      
      // Clear user state first for immediate UI response
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Clear all auth data from storage
      clearSession();
      clearAllAuthData();
      
      try {
        // Sign out from Supabase
        await supabase.auth.signOut({ scope: 'global' });
      } catch (supabaseError) {
        console.error("Error signing out from Supabase:", supabaseError);
        // Continue even if this fails
      }
      
      console.log("Sign out completed");
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error during sign out:", error);
      
      // Even if there's an error, still clear local state
      clearAllAuthData();
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  };

  // Simplified profile update
  const updateProfile = async (data: any) => {
    if (!user) {
      return { error: new Error('No authenticated user') };
    }

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      // If admin status is being updated, also update the stored value
      if (data.hasOwnProperty('is_admin')) {
        setIsAdmin(!!data.is_admin);
        storeAdminStatus(!!data.is_admin);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });

      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    error,
    initialized,
    sessionChecked,
    setProfile,
    updateProfile,
    signOut,
    validateSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
