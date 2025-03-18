
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { AuthContext } from './AuthContext';
import { UserProfile, AuthContextType } from './types';
import { fetchUserProfile, updateUserProfile, setUserAsAffiliate } from './authUtils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        console.log("AuthProvider - Checking active session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("AuthProvider - Found active session, user:", session.user.email);
          setUser(session.user);
          // Fetch user profile
          const profileData = await fetchUserProfile(session.user.id);
          
          setProfile(profileData);
          
          // Check if user is an affiliate
          if (profileData?.is_affiliate) {
            setIsAffiliate(true);
          }
          
          // Check if user is an admin
          if (profileData?.is_admin) {
            setIsAdmin(true);
          }
        } else {
          console.log("AuthProvider - No active session found");
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider - Auth state changed:", event);
        if (session?.user) {
          console.log("AuthProvider - User authenticated:", session.user.email);
          setUser(session.user);
          // Fetch user profile when auth state changes
          const profileData = await fetchUserProfile(session.user.id);
          
          setProfile(profileData);
          
          // Check if user is an affiliate
          if (profileData?.is_affiliate) {
            setIsAffiliate(true);
          } else {
            setIsAffiliate(false);
          }
          
          // Check if user is an admin
          if (profileData?.is_admin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          console.log("AuthProvider - User signed out or no session");
          setUser(null);
          setProfile(null);
          setIsAffiliate(false);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      console.log("AuthProvider - Signing up new user:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      return { error: error ? new Error(error.message) : null };
    } catch (error: any) {
      console.error("AuthProvider - Sign up error:", error.message);
      return { error: new Error(error.message) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthProvider - Signing in user:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error: error ? new Error(error.message) : null };
    } catch (error: any) {
      console.error("AuthProvider - Sign in error:", error.message);
      return { error: new Error(error.message) };
    }
  };

  const signInWithGoogle = async () => {
    console.log("AuthProvider - Initiating Google sign in");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });

    if (error) {
      console.error("AuthProvider - Google sign in error:", error.message);
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    console.log("AuthProvider - Signing out user");
    await supabase.auth.signOut();
    
    // Instead of using navigate, we'll use window.location
    window.location.href = '/';
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) return { error: new Error('No user authenticated') };
      
      console.log("AuthProvider - Updating user profile");
      const success = await updateUserProfile(user.id, data);
      
      if (success) {
        // Update local profile state
        setProfile(prevProfile => ({
          ...prevProfile,
          ...data
        } as UserProfile));
        
        return { error: null };
      }
      
      return { error: new Error('Failed to update profile') };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { error: new Error(error.message) };
    }
  };
  
  // Function to set a user as an affiliate (admin only function)
  const setAsAffiliate = async (userId: string) => {
    try {
      console.log("AuthProvider - Setting user as affiliate:", userId);
      const success = await setUserAsAffiliate(userId);
      
      // If updating the current user, update the state
      if (success && user && user.id === userId) {
        setIsAffiliate(true);
        setProfile(prevProfile => ({
          ...prevProfile,
          is_affiliate: true
        } as UserProfile));
      }
    } catch (error: any) {
      console.error('Error setting affiliate status:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isAffiliate,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    setAsAffiliate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
