
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, AuthResponse } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { AuthContext } from './AuthContext';
import { Profile } from './types';
import { fetchUserProfile, updateUserProfile, setUserAsAffiliate } from './authUtils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // Fetch user profile
          const profileData = await fetchUserProfile(session.user.id);
          
          setProfile(profileData);
          
          // Check if user is an affiliate
          if (profileData?.is_affiliate) {
            setIsAffiliate(true);
          }
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
        if (session?.user) {
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
        } else {
          setUser(null);
          setProfile(null);
          setIsAffiliate(false);
        }
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password
    });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });

    if (error) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    
    // Instead of using navigate, we'll use window.location
    window.location.href = '/';
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) return;
      
      const success = await updateUserProfile(user.id, data);
      
      if (success) {
        // Update local profile state
        setProfile({
          ...profile,
          ...data
        } as Profile);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
    }
  };
  
  // Function to set a user as an affiliate (admin only function)
  const setAsAffiliate = async (userId: string) => {
    try {
      const success = await setUserAsAffiliate(userId);
      
      // If updating the current user, update the state
      if (success && user && user.id === userId) {
        setIsAffiliate(true);
        setProfile({
          ...profile,
          is_affiliate: true
        } as Profile);
      }
    } catch (error: any) {
      console.error('Error setting affiliate status:', error);
    }
  };

  const value = {
    user,
    profile,
    isLoading,
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
