
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserProfile } from './types';
import { toast } from '@/components/ui/use-toast';

console.log('🔍 AuthProvider.tsx is being imported - simplified version');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔍 AuthProvider component initializing - simplified version');
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [supabaseInitError, setSupabaseInitError] = useState<boolean>(false);

  useEffect(() => {
    console.log("🔍 AuthProvider: Setting up auth state - simplified");
    
    let isMounted = true;
    
    // Use a short timeout to prevent permanent loading state
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("🔍 AuthProvider: Auth state timeout reached, continuing with app");
        setIsLoading(false);
        setSessionChecked(true);
      }
    }, 1500);
    
    // Set up auth state listener
    try {
      console.log("🔍 AuthProvider: Trying to set up auth listener");
      
      // Check if supabase is fully initialized
      if (!supabase || !supabase.auth) {
        throw new Error("Supabase client is not properly initialized");
      }
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!isMounted) return;
          
          console.log('🔍 AuthProvider: Auth state changed:', event);
          
          if (session?.user) {
            console.log('🔍 AuthProvider: User is authenticated:', session.user.email);
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at
            });
          } else {
            console.log('🔍 AuthProvider: No active session');
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
          
          setIsLoading(false);
          setSessionChecked(true);
        }
      );
      
      // Check for existing session with error handling
      const checkSession = async () => {
        try {
          console.log("🔍 AuthProvider: Checking for current session");
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('🔍 AuthProvider: Error checking session:', sessionError);
            setError(sessionError instanceof Error ? sessionError : new Error('Unknown error'));
            setIsLoading(false);
            setSessionChecked(true);
            return;
          }
          
          if (data.session?.user) {
            console.log("🔍 AuthProvider: Found active session for user:", data.session.user.email);
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              created_at: data.session.user.created_at,
              last_sign_in_at: data.session.user.last_sign_in_at
            });
          } else {
            console.log("🔍 AuthProvider: No active session found");
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
          
          setIsLoading(false);
          setSessionChecked(true);
        } catch (error) {
          console.error('🔍 AuthProvider: Exception checking session:', error);
          setError(error instanceof Error ? error : new Error('Unknown error'));
          setIsLoading(false);
          setSessionChecked(true);
        }
      };
      
      // Use Promise.race with a timeout to prevent hanging
      Promise.race([
        checkSession(),
        new Promise(resolve => setTimeout(() => {
          console.log("🔍 AuthProvider: Session check timed out");
          if (isMounted) {
            setIsLoading(false);
            setSessionChecked(true);
          }
          resolve(null);
        }, 1000))
      ]);
      
      // Clean up
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('🔍 AuthProvider: Error setting up auth state:', error);
      setSupabaseInitError(true);
      setIsLoading(false);
      setSessionChecked(true);
      setError(error instanceof Error ? error : new Error('Unknown error setting up auth'));
      
      // Continue with children even if Supabase initialization fails
      // This allows the app to render without authentication features
      
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }
  }, []);

  useEffect(() => {
    // Display a toast if Supabase initialization failed
    if (supabaseInitError) {
      console.log("🔍 Displaying error toast for Supabase initialization error");
      toast({
        title: "Database Connection Issue",
        description: "Unable to connect to the database. Some features may be unavailable.",
        variant: "destructive",
      });
    }
  }, [supabaseInitError]);

  console.log("🔍 AuthProvider state:", { 
    isAuthenticated: !!user, 
    isLoading, 
    isAdmin,
    sessionChecked,
    hasError: !!error || supabaseInitError
  });

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin, 
    error,
    sessionChecked,
    initialized: true,
    setProfile: (newProfile: UserProfile | null) => setProfile(newProfile),
    updateProfile: (newProfile: UserProfile | null) => setProfile(newProfile),
    signOut: async () => {
      try {
        console.log('🔍 AuthProvider: Signing out user');
        if (supabase && supabase.auth) {
          await supabase.auth.signOut();
        }
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        return { success: true, error: null };
      } catch (error) {
        console.error("🔍 AuthProvider: Error during sign out:", error);
        return { success: false, error };
      }
    }
  };

  // Always render children even if there are authentication errors
  // This allows the app to function without authentication features
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

console.log('🔍 AuthProvider.tsx has been loaded - simplified version');
