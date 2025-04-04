
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
      console.log("useAuthOperations - Signing up user:", email);
      const result = await signUpUser(email, password);
      
      if (result.error) {
        console.error("useAuthOperations - Signup error:", result.error.message);
      } else {
        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account.",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("useAuthOperations - Unexpected signup error:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("useAuthOperations - Signing in user:", email);
      const result = await signInUser(email, password);
      
      if (result.error) {
        console.error("useAuthOperations - Login error:", result.error.message);
      } else {
        console.log("useAuthOperations - Login successful");
      }
      
      return result;
    } catch (error: any) {
      console.error("useAuthOperations - Unexpected login error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("useAuthOperations - Signing out");
      const { success, error } = await signOutUser();
      
      if (error) {
        console.error("useAuthOperations - Sign out error:", error);
      } else {
        toast({
          title: "Signed out successfully",
        });
      }
      
      return { success, error };
    } catch (error: any) {
      console.error("useAuthOperations - Unexpected error during sign out:", error);
      return { success: false, error };
    }
  };

  const updateUserProfile = async (userId: string, profileData: any) => {
    try {
      console.log("useAuthOperations - Updating user profile:", userId);
      const result = await updateUserProfileAction(userId, profileData);
      
      if (result.error) {
        console.error("useAuthOperations - Profile update error:", result.error.message);
      } else {
        toast({
          title: "Profile updated successfully",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("useAuthOperations - Unexpected profile update error:", error);
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
