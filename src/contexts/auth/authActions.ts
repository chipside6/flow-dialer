
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
  
  // Completely clear auth storage first as top priority
  try {
    // First clear ALL possible localStorage auth-related items
    console.log("authActions - Clearing all local storage auth items");
    
    // Target specific known auth tokens
    localStorage.removeItem('sb-grhvoclalziyjbjlhpml-auth-token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user_session');
    
    // Clear ALL items that might be related to auth
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        console.log(`authActions - Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Reset Supabase auth client session immediately
    try {
      // @ts-ignore - Accessing internal method
      if (supabase.auth._session) {
        console.log("authActions - Manually clearing Supabase internal session");
        // @ts-ignore - Reset the session object
        supabase.auth._session = null;
      }
    } catch (e) {
      console.warn("Failed to manually clear Supabase session:", e);
    }
    
    // Try to sign out from Supabase (not critical if this fails)
    try {
      console.log("authActions - Calling Supabase signOut method");
      await supabase.auth.signOut({ scope: 'global' });
    } catch (supabaseError) {
      console.warn("authActions - Warning during Supabase signOut call:", supabaseError);
      // Continue with the sign out process even if this fails
    }
    
    // Try to sign out from custom backend API (not critical if this fails)
    try {
      console.log("authActions - Calling backend API signOut method");
      await apiSignOut();
    } catch (apiError) {
      console.warn("authActions - API sign out error:", apiError);
      // Continue with the sign out process even if the API call fails
    }
    
    console.log("authActions - Logout process completed successfully");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("authActions - Sign out error:", error.message);
    
    // Make a best effort to clear local storage even if other parts failed
    try {
      localStorage.removeItem('sb-grhvoclalziyjbjlhpml-auth-token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('user_session');
    } catch (e) {
      console.error("Final attempt to clear storage failed:", e);
    }
    
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
