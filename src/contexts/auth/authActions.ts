
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export async function signUpUser(email: string, password: string) {
  try {
    console.log("Attempting to sign up user:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error("Signup error:", error.message);
      return { error: new Error(error.message) };
    }
    
    console.log("Signup successful, user:", data.user);
    return { error: null, user: data.user };
  } catch (error: any) {
    console.error("Unexpected signup error:", error);
    return { error: new Error(error.message || 'Error signing up') };
  }
}

export async function signInUser(email: string, password: string) {
  try {
    console.log("Attempting to sign in with:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error);
      return { error: new Error(error.message) };
    }
    
    console.log("Login successful, user:", data.user);
    return { error: null, user: data.user, session: data.session };
  } catch (error: any) {
    console.error("Unexpected login error:", error);
    return { error: new Error(error.message || 'Error signing in') };
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    return {
      success: !error,
      error: error ? new Error(error.message) : null
    };
  } catch (error: any) {
    return {
      success: false,
      error: new Error(error.message || 'Error signing out')
    };
  }
}

export async function updateUserProfileAction(userId: string, profileData: Partial<UserProfile>) {
  try {
    console.log("Updating user profile via action:", userId, profileData);
    
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    
    if (error) {
      console.error("Profile update error:", error);
      return { error: new Error(error.message) };
    }
    
    console.log("Profile updated successfully via action");
    return { error: null };
  } catch (error: any) {
    console.error("Unexpected profile update error:", error);
    return { error: new Error(error.message || 'Error updating profile') };
  }
}
