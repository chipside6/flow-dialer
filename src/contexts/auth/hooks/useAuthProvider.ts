
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
  const profileState = useProfileState(authSession.user);

  // Helper function to activate trial plan for new users
  const activateTrialForNewUser = async (userId: string) => {
    // This functionality is moved to a separate file
    const { activateTrialPlan } = await import('./useTrialActivation');
    return activateTrialPlan(userId);
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
        
        // Activate trial plan for new user using setTimeout to prevent blocking
        setTimeout(() => {
          activateTrialForNewUser(authSession.user!.id);
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
    setIsLoading(authSession.isLoading);
  }, [authSession.isLoading]);

  return {
    user: authSession.user,
    profile: profileState.profile,
    isLoading,
    isAuthenticated: !!authSession.user,
    isAdmin: profileState.isAdmin,
    error: authSession.error,
    sessionChecked: authSession.sessionChecked,
    initialized: initialized && authSession.initialized,
    updateProfile: profileState.updateProfile,
    signOut: authSession.signOut
  };
}
