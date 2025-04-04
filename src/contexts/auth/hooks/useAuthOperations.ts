
import { useState } from 'react';
import { 
  signUpUser, 
  signInUser, 
  signOutUser,
  updateUserProfileAction
} from '../authActions';
import { toast } from '@/components/ui/use-toast';

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
      const { success, error } = await signOutUser();
      
      if (error) {
        console.error("Sign out error:", error);
      } else {
        toast({
          title: "Signed out successfully",
        });
      }
      
      return { success, error };
    } catch (error: any) {
      console.error("Unexpected error during sign out:", error);
      return { success: false, error };
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
