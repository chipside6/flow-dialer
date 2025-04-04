
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
        toast({
          title: "Signup failed",
          description: result.error.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("useAuthOperations - Unexpected signup error:", error);
      toast({
        title: "Unexpected error during signup",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("useAuthOperations - Signing in user:", email);
      
      // Create a promise that will reject after a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Login request timed out. Please try again."));
        }, 8000); // 8 second timeout (reduced from 10)
      });
      
      // Race the sign in request against the timeout
      const result = await Promise.race([
        signInUser(email, password),
        timeoutPromise
      ]) as { error: Error | null, session?: any };
      
      if (result.error) {
        console.error("useAuthOperations - Login error:", result.error.message);
        toast({
          title: "Login failed",
          description: result.error.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("useAuthOperations - Unexpected login error:", error);
      
      // Provide more specific error messages
      const errorMessage = error.message?.includes('timeout') 
        ? "Login request timed out. Please try again." 
        : error.message?.includes('network') 
          ? "Network error. Please check your internet connection." 
          : error.message || "Please try again later";
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("useAuthOperations - Signing out");
      const { success, error } = await signOutUser();
      
      if (error) {
        console.error("useAuthOperations - Sign out error:", error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { success, error };
    } catch (error: any) {
      console.error("useAuthOperations - Unexpected error during sign out:", error);
      toast({
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateUserProfile = async (userId: string, profileData: any) => {
    try {
      console.log("useAuthOperations - Updating user profile:", userId);
      const result = await updateUserProfileAction(userId, profileData);
      
      if (result.error) {
        console.error("useAuthOperations - Profile update error:", result.error.message);
        toast({
          title: "Profile update failed",
          description: result.error.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("useAuthOperations - Unexpected profile update error:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
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
