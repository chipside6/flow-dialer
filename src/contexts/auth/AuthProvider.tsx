
import React, { useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { 
  getStoredSession, 
  fetchUserProfile, 
  signUp as signUpService, 
  signIn as signInService, 
  signOut as signOutService, 
  updateUserProfile, 
  setUserAsAffiliate,
  User, 
  UserProfile, 
  Session 
} from '@/services/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Effect to check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking for existing session");
        setIsLoading(true);
        
        const storedSession = getStoredSession();
        
        if (storedSession) {
          console.log("Found stored session for user:", storedSession.user.email);
          setUser(storedSession.user);
          
          // Fetch user profile
          const userProfile = await fetchUserProfile(storedSession.user.id);
          
          if (userProfile) {
            setProfile(userProfile);
            setIsAdmin(!!userProfile.is_admin);
            setIsAffiliate(!!userProfile.is_affiliate);
          }
        } else {
          console.log("No stored session found");
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsAffiliate(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
        setInitialized(true);
      }
    };
    
    checkSession();
  }, []);

  // Sign up a new user - remove metadata parameter
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await signUpService(email, password);
      
      // Update local state if session is returned from signup
      if (!result.error && result.session) {
        setUser(result.session.user);
        
        // Try to fetch user profile
        const userProfile = await fetchUserProfile(result.session.user.id);
        
        if (userProfile) {
          setProfile(userProfile);
          setIsAdmin(!!userProfile.is_admin);
          setIsAffiliate(!!userProfile.is_affiliate);
        }
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in an existing user
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await signInService(email, password);
      
      if (!result.error && result.session) {
        setUser(result.session.user);
        
        // Fetch user profile
        const userProfile = await fetchUserProfile(result.session.user.id);
        
        if (userProfile) {
          setProfile(userProfile);
          setIsAdmin(!!userProfile.is_admin);
          setIsAffiliate(!!userProfile.is_affiliate);
        }
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out the current user
  const signOut = async () => {
    try {
      setIsLoading(true);
      const result = await signOutService();
      
      // Regardless of API result, clear local state
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setIsAffiliate(false);
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfileHandler = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user authenticated') };
    }
    
    try {
      const success = await updateUserProfile(user.id, data);
      
      if (success) {
        // Update local profile state
        setProfile(prevProfile => ({
          ...prevProfile,
          ...data
        } as UserProfile));
        
        return { error: null };
      }
      
      return { error: new Error('Failed to update profile') };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  // Set a user as an affiliate
  const setAsAffiliateHandler = async (userId: string) => {
    try {
      const success = await setUserAsAffiliate(userId);
      
      if (success && user && user.id === userId) {
        setIsAffiliate(true);
        setProfile(prevProfile => ({
          ...prevProfile,
          is_affiliate: true
        } as UserProfile));
      }
    } catch (error: any) {
      console.error('Error setting affiliate status:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isAffiliate,
    initialized,
    sessionChecked,
    signUp,
    signIn,
    signOut,
    updateProfile: updateProfileHandler,
    setAsAffiliate: setAsAffiliateHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
