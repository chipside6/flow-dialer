
import { supabase } from '@/integrations/supabase/client';
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
    // Clear ALL known auth-related localStorage items
    localStorage.removeItem('sb-grhvoclalziyjbjlhpml-auth-token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user_session');
    
    // Use a for-loop instead of forEach with Object.keys to handle
    // potential asynchronous issues when removing multiple items
    const localStorageKeys = Object.keys(localStorage);
    for (let i = 0; i < localStorageKeys.length; i++) {
      const key = localStorageKeys[i];
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        console.log(`authActions - Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    }
    
    try {
      // Try to sign out from backend API (not critical if this fails)
      await apiSignOut();
    } catch (apiError) {
      console.warn("authActions - API sign out warning:", apiError);
      // Continue with the sign out process even if the API call fails
    }
    
    try {
      // Try to sign out from Supabase (not critical if this fails)
      await supabase.auth.signOut({ scope: 'global' });
    } catch (supabaseError) {
      console.warn("authActions - Supabase signOut warning:", supabaseError);
      // Continue with the sign out process even if this fails
    }
    
    console.log("authActions - Logout process completed successfully");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("authActions - Sign out error:", error.message);
    
    // Final attempt to clear critical auth tokens
    try {
      localStorage.removeItem('sb-grhvoclalziyjbjlhpml-auth-token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('user_session');
    } catch (e) {
      console.error("Final attempt to clear storage failed:", e);
    }
    
    // Even if we got an error, consider it a successful logout since we've cleared local storage
    return { success: true, error };
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
