
import { useState, useEffect } from 'react';
import type { User, UserProfile } from '../types';
import { fetchUserProfile } from '../authUtils';

export function useProfileState(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Effect to fetch profile when user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setIsAdmin(false);
        }
        return;
      }
      
      try {
        // Fetch profile data with admin status
        const userProfile = await fetchUserProfile(user.id);
        console.log("ProfileState: Fetched user profile:", userProfile);
        
        if (!isMounted) return;
        
        if (userProfile) {
          // Make sure to set the email from the auth user
          const updatedProfile = {
            ...userProfile,
            email: user.email || ''
          };
          setProfile(updatedProfile);
          
          // Explicitly convert is_admin to boolean to prevent type issues
          const isAdminFlag = updatedProfile.is_admin === true;
          setIsAdmin(isAdminFlag);
          console.log("ProfileState: Set isAdmin flag to:", isAdminFlag);
        } else {
          // Set isAdmin to false when no profile is found
          console.log("ProfileState: No profile found, setting isAdmin to false");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('ProfileState: Error fetching profile:', error);
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    };
    
    loadProfile();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handler for updating the profile with improved admin handling
  const updateProfile = (newProfile: UserProfile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      // Explicitly convert is_admin to boolean to avoid type issues
      const adminFlag = newProfile.is_admin === true;
      setIsAdmin(adminFlag);
      console.log("ProfileState: Updated isAdmin flag to:", adminFlag);
    } else {
      setIsAdmin(false);
    }
  };

  return {
    profile,
    isAdmin,
    updateProfile
  };
}
