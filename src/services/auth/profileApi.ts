
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
    
    const response = await fetch(`${API_URL}/profiles/${userId}`, {
      headers: {
        'Authorization': `Bearer ${session.token || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const data = await response.json();
    console.log("Profile retrieved successfully:", data);
    
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
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
    
    const response = await fetch(`${API_URL}/profiles/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.id}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
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

// Set a user as an affiliate
export const setUserAsAffiliate = async (userId: string): Promise<boolean> => {
  try {
    console.log("Setting user as affiliate:", userId);
    const session = getStoredSession();
    
    if (!session) {
      console.error("No active session found");
      return false;
    }
    
    const response = await fetch(`${API_URL}/profiles/${userId}/affiliate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.id}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to set user as affiliate');
    }
    
    console.log("User set as affiliate successfully");
    toast({
      title: "Affiliate status updated",
      description: "User has been set as an affiliate.",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error setting affiliate status:", error.message);
    toast({
      title: "Error updating affiliate status",
      description: error.message,
      variant: "destructive",
    });
    
    return false;
  }
};
