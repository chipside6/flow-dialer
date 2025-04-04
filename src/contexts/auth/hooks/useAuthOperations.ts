
import { useState } from 'react';
import { 
  signUpUser, 
  signInUser, 
  signOutUser,
  updateUserProfileAction
} from '../authActions';
import { toast } from '@/components/ui/use-toast';
import { clearAllAuthData } from '@/utils/sessionCleanup';

export function useAuthOperations() {
  const signUp = async (email: string, password: string) => {
    try {
      const result = await signUpUser(email, password);
      
      if (result.error) {
        console.error("Signup error:", result.error.message);
      } else {
        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account.",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInUser(email, password);
      
      if (result.error) {
        console.error("Login error:", result.error.message);
      }
      
      return result;
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // First clear all local auth data
      clearAllAuthData();
      
      // Then try to sign out from the server as a background operation
      signOutUser().catch(error => {
        console.warn("Error during server sign out:", error);
        // Still consider it a successful logout for UX purposes
      });
      
      // Consider logout successful regardless of server response
      toast({
        title: "Signed out successfully",
      });
      
      // Force page reload to clear any remaining state
      window.location.href = '/login';
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Unexpected error during sign out:", error);
      
      // Still clear data and redirect on error
      clearAllAuthData();
      window.location.href = '/login';
      
      return { success: true, error };
    }
  };

  const updateUserProfile = async (userId: string, profileData: any) => {
    try {
      const result = await updateUserProfileAction(userId, profileData);
      
      if (result.error) {
        console.error("Profile update error:", result.error.message);
      } else {
        toast({
          title: "Profile updated successfully",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("Unexpected profile update error:", error);
      return { error };
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    updateUserProfile
  };
}
