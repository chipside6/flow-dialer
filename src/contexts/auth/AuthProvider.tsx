
import React from 'react';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from './hooks/useAuthProvider';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  console.log("AuthProvider: Current state:", { 
    isAuthenticated: auth.isAuthenticated, 
    isLoading: auth.isLoading, 
    initialized: auth.initialized, 
    sessionChecked: auth.sessionChecked,
    isAdmin: auth.isAdmin
  });

  const value = {
    user: auth.user,
    profile: auth.profile,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    error: auth.error,
    sessionChecked: auth.sessionChecked,
    initialized: auth.initialized,
    setProfile: auth.updateProfile,
    updateProfile: auth.updateProfile,
    signOut: auth.signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
