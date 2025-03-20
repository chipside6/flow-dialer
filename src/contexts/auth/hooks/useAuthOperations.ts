
import { useState } from 'react';
import { 
  signUpUser, 
  signInUser, 
  signOutUser,
  updateUserProfileAction,
  setAsAffiliateAction
} from '../authActions';
import { toast } from '@/components/ui/use-toast';

export function useAuthOperations() {
  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      const result = await signUpUser(email, password, metadata);
      if (result.error) {
        toast({
          title: "Signup failed",
          description: result.error.message,
          variant: "destructive",
        });
      }
      return result;
    } catch (error: any) {
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
      const result = await signInUser(email, password);
      if (result.error) {
        toast({
          title: "Login failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
      return result;
    } catch (error: any) {
      toast({
        title: "Unexpected error during login",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { success, error } = await signOutUser();
      if (success) {
        toast({
          title: "Logged out successfully",
          description: "You have been signed out",
        });
        window.location.href = '/';
      } else if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    signUp,
    signIn,
    signOut
  };
}
