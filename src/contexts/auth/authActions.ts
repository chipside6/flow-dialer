import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserProfile } from './types';
import { fetchUserProfile, updateUserProfile } from './authUtils';
import { signOut as apiSignOut } from '@/services/auth';

export const signUpUser = async (email: string, password: string) => {
  try {
    console.log("authActions - Signing up new user:", email);
    const { error } = await supabase.auth.signUp({
      email,
      password
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
    // First try to sign out from Supabase
    const { error: supabaseError } = await supabase.auth.signOut();
    
    // Also try to sign out from custom backend API
    const apiResult = await apiSignOut();
    
    // If there was an error with Supabase signout
    if (supabaseError) {
      console.error("authActions - Supabase sign out error:", supabaseError.message);
      toast({
        title: "Warning during sign out",
        description: "Your session may not be fully cleared",
        variant: "destructive",
      });
      return { success: true, error: supabaseError }; // Still return success as we're doing our best effort
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
