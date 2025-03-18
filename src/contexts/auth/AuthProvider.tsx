
import React from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    return signUpUser(email, password, metadata);
  };

  const signIn = async (email: string, password: string) => {
    return signInUser(email, password);
  };

  const signInWithGoogle = async () => {
    await signInWithGoogleAction();
  };

  const signOut = async () => {
    const { success } = await signOutUser();
    if (success) {
      // Redirect to home page
      window.location.href = '/';
    }
  };

  const updateProfile = async (data: Partial<typeof profile>) => {
    if (!user) return { error: new Error('No user authenticated') };
    
    const result = await updateUserProfileAction(user.id, data);
    
    if (!result.error) {
      // Update local profile state
      setProfile(prevProfile => ({
        ...prevProfile,
        ...data
      } as typeof profile));
    }
    
    return result;
  };
  
  // Function to set a user as an affiliate (admin only function)
  const setAsAffiliate = async (userId: string) => {
    const { success } = await setAsAffiliateAction(userId);
    
    // If updating the current user, update the state
    if (success && user && user.id === userId) {
      setIsAffiliate(true);
      setProfile(prevProfile => ({
        ...prevProfile,
        is_affiliate: true
      } as typeof profile));
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isAffiliate,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    setAsAffiliate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
