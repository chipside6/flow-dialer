
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthSession } from './useAuthSession';
import { AuthContextType } from './types';
import { 
  signUpUser, 
  signInUser, 
  signInWithGoogleAction, 
  signOutUser,
  updateUserProfileAction,
  setAsAffiliateAction
} from './authActions';
import { toast } from '@/components/ui/use-toast';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const { 
    user, 
    profile, 
    isLoading, 
    isAuthenticated, 
    isAdmin, 
    isAffiliate,
    setProfile,
    setIsAffiliate
  } = useAuthSession();

  // Mark when initial auth check is complete
  useEffect(() => {
    if (!isLoading) {
      setInitialized(true);
      if (user) {
        console.log("Auth initialized - User authenticated:", user.email);
      } else {
        console.log("Auth initialized - No user authenticated");
      }
    }
  }, [isLoading, user]);

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

  const signInWithGoogle = async () => {
    try {
      await signInWithGoogleAction();
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { success, error } = await signOutUser();
      if (success) {
        // Redirect to home page
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

  const updateProfile = async (data: Partial<typeof profile>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return { error: new Error('No user authenticated') };
    }
    
    try {
      const result = await updateUserProfileAction(user.id, data);
      
      if (!result.error) {
        // Update local profile state
        setProfile(prevProfile => ({
          ...prevProfile,
          ...data
        } as typeof profile));
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Profile update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      return { error };
    }
  };
  
  // Function to set a user as an affiliate (admin only function)
  const setAsAffiliate = async (userId: string) => {
    try {
      const { success, error } = await setAsAffiliateAction(userId);
      
      if (error) {
        toast({
          title: "Affiliate status update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // If updating the current user, update the state
      if (success && user && user.id === userId) {
        setIsAffiliate(true);
        setProfile(prevProfile => ({
          ...prevProfile,
          is_affiliate: true
        } as typeof profile));
        
        toast({
          title: "Affiliate status updated",
          description: "You are now an affiliate",
        });
      }
    } catch (error: any) {
      toast({
        title: "Affiliate status update failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isAffiliate,
    initialized, // Add the initialized flag to the context
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    setAsAffiliate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
