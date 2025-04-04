import { useState, useEffect } from 'react';
import type { User, UserProfile } from '../types';
import { fetchUserProfile, refreshAdminStatus } from '../authUtils';

export function useProfileState(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminCheckTimestamp, setAdminCheckTimestamp] = useState<number>(0);
  
  // Effect to fetch profile when user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setIsAdmin(false);
          setAdminCheckTimestamp(0);
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
          const isAdminFlag = userProfile.is_admin === true;
          setIsAdmin(isAdminFlag);
          setAdminCheckTimestamp(Date.now());
          
          // Store admin status in localStorage for persistence across page reloads
          if (isAdminFlag) {
            localStorage.setItem('user_is_admin', 'true');
            localStorage.setItem('admin_check_timestamp', Date.now().toString());
          } else {
            localStorage.removeItem('user_is_admin');
            localStorage.removeItem('admin_check_timestamp');
          }
          
          console.log("ProfileState: Set isAdmin flag to:", isAdminFlag);
        } else {
          // Set isAdmin to false when no profile is found
          console.log("ProfileState: No profile found, setting isAdmin to false");
          setIsAdmin(false);
          localStorage.removeItem('user_is_admin');
          localStorage.removeItem('admin_check_timestamp');
        }
      } catch (error) {
        console.error('ProfileState: Error fetching profile:', error);
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    };
    
    // Try to restore admin status from localStorage while fetching from server
    if (user) {
      const cachedIsAdmin = localStorage.getItem('user_is_admin') === 'true';
      const cachedTimestamp = parseInt(localStorage.getItem('admin_check_timestamp') || '0', 10);
      const now = Date.now();
      
      // Only use cached value if it's not too old (less than 30 minutes)
      if (cachedIsAdmin && (now - cachedTimestamp < 30 * 60 * 1000)) {
        setIsAdmin(true);
        setAdminCheckTimestamp(cachedTimestamp);
      }
    }
    
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
      setAdminCheckTimestamp(Date.now());
      
      // Update localStorage
      if (adminFlag) {
        localStorage.setItem('user_is_admin', 'true');
        localStorage.setItem('admin_check_timestamp', Date.now().toString());
      } else {
        localStorage.removeItem('user_is_admin');
        localStorage.removeItem('admin_check_timestamp');
      }
      
      console.log("ProfileState: Updated isAdmin flag to:", adminFlag);
    } else {
      setIsAdmin(false);
      localStorage.removeItem('user_is_admin');
      localStorage.removeItem('admin_check_timestamp');
    }
  };
  
  // Function to refresh admin status periodically
  const checkAdminStatus = async () => {
    if (!user || !user.id) return;
    
    // Only check if it's been more than 5 minutes since last check
    const now = Date.now();
    if (now - adminCheckTimestamp < 5 * 60 * 1000) return;
    
    try {
      const isUserAdmin = await refreshAdminStatus(user.id);
      setIsAdmin(isUserAdmin);
      setAdminCheckTimestamp(now);
      
      // Update localStorage
      if (isUserAdmin) {
        localStorage.setItem('user_is_admin', 'true');
        localStorage.setItem('admin_check_timestamp', now.toString());
      } else {
        localStorage.removeItem('user_is_admin');
        localStorage.removeItem('admin_check_timestamp');
      }
    } catch (error) {
      console.error('Error refreshing admin status:', error);
      // Don't change isAdmin state on error, keep existing value
    }
  };

  return {
    profile,
    isAdmin,
    updateProfile,
    checkAdminStatus
  };
}
