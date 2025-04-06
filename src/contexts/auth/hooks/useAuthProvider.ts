
import { useState, useEffect } from 'react';
import type { User, UserProfile } from '../types';
import { useAuthSession } from './useAuthSession';
import { useProfileState } from './useProfileState';
import { ensureVoiceAppUploadsBucket } from '@/services/supabase/greetingFilesService';

export function useAuthProvider() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Use the dedicated hooks for auth session and profile state
  const authSession = useAuthSession();
  
  // Convert Supabase User to our custom User type when needed
  const userForProfile = authSession.user ? {
    id: authSession.user.id,
    email: authSession.user.email || '',
    created_at: authSession.user.created_at,
    last_sign_in_at: authSession.user.last_sign_in_at
  } as User : null;
  
  const profileState = useProfileState(userForProfile);

  // Helper function to set up free plan for new users
  const setupFreeUserPlan = async (userId: string) => {
    if (!userId) return false;
    
    try {
      console.log("Setting up free plan for new user:", userId);
      
      // Import the createLifetimeSubscription function from the API
      const { createLifetimeSubscription, getPlanById } = await import('@/services/subscriptionService');
      
      // Get the free plan from the pricing plans
      const freePlan = getPlanById('free');
      
      if (!freePlan) {
        console.error("Free plan not found");
        return false;
      }
      
      // Create a free plan subscription
      const success = await createLifetimeSubscription(userId, freePlan);
      
      if (success) {
        console.log("Free plan set up successfully");
        localStorage.setItem('userSubscriptionPlan', 'free');
        return true;
      } else {
        console.error("Failed to set up free plan");
        return false;
      }
    } catch (error) {
      console.error("Error setting up free plan:", error);
      return false;
    }
  };

  // Effect to coordinate between session and profile states
  useEffect(() => {
    const initializeExtras = async () => {
      if (authSession.user) {
        // Check bucket existence but don't block on failure
        try {
          await ensureVoiceAppUploadsBucket();
        } catch (bucketError) {
          console.warn('Could not verify storage bucket, but continuing:', bucketError);
          // Don't block the auth flow for storage issues
        }
        
        // Set up free plan for new user using setTimeout to prevent blocking
        setTimeout(() => {
          if (authSession.user) {
            setupFreeUserPlan(authSession.user.id);
          }
        }, 0);
      }
      
      setIsLoading(false);
      setInitialized(true);
    };
    
    if (authSession.initialized && !initialized) {
      initializeExtras();
    }
  }, [authSession.initialized, authSession.user, initialized]);

  // Combine loading states
  useEffect(() => {
    setIsLoading(authSession.loading || authSession.isLoading);
  }, [authSession.loading, authSession.isLoading]);
  
  // Periodically refresh admin status for logged-in users
  useEffect(() => {
    if (!authSession.user || !initialized) return;
    
    // Check admin status every 15 minutes for active sessions
    const adminRefreshInterval = setInterval(() => {
      profileState.checkAdminStatus();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(adminRefreshInterval);
  }, [authSession.user, initialized, profileState]);

  return {
    user: authSession.user,
    profile: profileState.profile,
    isLoading,
    isAuthenticated: !!authSession.user,
    isAdmin: profileState.isAdmin,
    error: authSession.error || authSession.refreshError,
    sessionChecked: authSession.sessionChecked,
    initialized: initialized && authSession.initialized,
    updateProfile: profileState.updateProfile,
    signOut: authSession.signOut
  };
}
