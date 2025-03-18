
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthSession } from './useAuthSession';
import { AuthContextType } from './types';
import { useAuthOperations } from './hooks/useAuthOperations';
import { useProfileOperations } from './hooks/useProfileOperations';

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

  // Auth operations hooks
  const { signUp, signIn, signInWithGoogle, signOut } = useAuthOperations();
  
  // Profile operations hooks
  const { updateProfile, setAsAffiliate } = useProfileOperations(
    user, 
    setProfile, 
    setIsAffiliate
  );

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

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isAffiliate,
    initialized,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    setAsAffiliate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
