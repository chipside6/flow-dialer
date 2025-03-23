
import { toast } from "@/components/ui/use-toast";
import { UserProfile, API_URL } from './types';
import { getStoredSession } from './session';

// Fetch user profile
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching user profile for:", userId);
    const session = getStoredSession();
    
    if (!session) {
      console.error("No active session found");
      return null;
    }
    
    console.log("Making profile request to:", `${API_URL}/profiles/${userId}`);
    const response = await fetch(`${API_URL}/profiles/${userId}`, {
      headers: {
        'Authorization': `Bearer ${session.token || ''}`
      },
      // Add these options to help with CORS and network issues
      mode: 'cors',
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      console.error("Profile fetch error:", response.status);
      throw new Error(`Failed to fetch user profile (${response.status})`);
    }
    
    const data = await response.json();
    console.log("Profile retrieved successfully:", data);
    
    return data as UserProfile;
  } catch (error: any) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<boolean> => {
  try {
    console.log("Updating profile for user:", userId);
    const session = getStoredSession();
    
    if (!session) {
      console.error("No active session found");
      return false;
    }
    
    console.log("Making profile update request to:", `${API_URL}/profiles/${userId}`);
    const response = await fetch(`${API_URL}/profiles/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token || ''}`
      },
      body: JSON.stringify(data),
      // Add these options to help with CORS and network issues
      mode: 'cors',
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      console.error("Profile update error:", response.status);
      throw new Error(`Failed to update user profile (${response.status})`);
    }
    
    console.log("Profile updated successfully");
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    toast({
      title: "Error updating profile",
      description: error.message,
      variant: "destructive",
    });
    
    return false;
  }
};
