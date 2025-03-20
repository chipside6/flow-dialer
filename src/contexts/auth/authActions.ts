
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserProfile } from './types';
import { fetchUserProfile, updateUserProfile, setUserAsAffiliate } from './authUtils';

export const signUpUser = async (email: string, password: string, metadata?: { full_name?: string }) => {
  try {
    console.log("authActions - Signing up new user:", email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    return { error: error ? new Error(error.message) : null };
  } catch (error: any) {
    console.error("authActions - Sign up error:", error.message);
    return { error: new Error(error.message) };
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    console.log("authActions - Signing in user:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error ? new Error(error.message) : null };
  } catch (error: any) {
    console.error("authActions - Sign in error:", error.message);
    return { error: new Error(error.message) };
  }
};

export const signOutUser = async () => {
  console.log("authActions - Signing out user");
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("authActions - Sign out error:", error.message);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("authActions - Sign out error:", error.message);
    return { success: false, error };
  }
};

export const updateUserProfileAction = async (userId: string, data: Partial<UserProfile>) => {
  try {
    if (!userId) return { error: new Error('No user authenticated') };
    
    console.log("authActions - Updating user profile");
    const success = await updateUserProfile(userId, data);
    
    if (success) {
      return { error: null };
    }
    
    return { error: new Error('Failed to update profile') };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { error: new Error(error.message) };
  }
};

export const setAsAffiliateAction = async (userId: string) => {
  try {
    console.log("authActions - Setting user as affiliate:", userId);
    const success = await setUserAsAffiliate(userId);
    return { success, error: null };
  } catch (error: any) {
    console.error('Error setting affiliate status:', error);
    return { success: false, error };
  }
};
