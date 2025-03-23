import { toast } from "@/components/ui/use-toast";

export interface User {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_admin?: boolean;
  is_affiliate?: boolean;
  email?: string;
  company_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  user: User;
  expires_at: number;
}

// Define API URL - this will be used across all services
// Change from localhost:3001 to localhost:5000 to match the port in backend/src/index.js
export const API_URL = 'http://localhost:5000/api';

// Storage key for local session data
const SESSION_STORAGE_KEY = 'user_session';

// Get stored session
export const getStoredSession = (): Session | null => {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedSession) return null;
  
  try {
    return JSON.parse(storedSession);
  } catch (error) {
    console.error('Error parsing stored session:', error);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

// Store session
export const storeSession = (session: Session): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

// Clear session
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

// Sign up a new user
export const signUp = async (email: string, password: string, metadata?: { full_name?: string }): Promise<{ error: Error | null }> => {
  try {
    console.log("Signing up new user:", email);
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        metadata
      })
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to sign up');
    }
    
    const data = await response.json();
    return { error: null };
  } catch (error: any) {
    console.error("Sign up error:", error.message);
    return { error: new Error(error.message) };
  }
};

// Sign in an existing user
export const signIn = async (email: string, password: string): Promise<{ error: Error | null, session?: Session }> => {
  try {
    console.log("Signing in user:", email);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Invalid login credentials');
    }
    
    // Store the session
    storeSession(data.session);
    
    return { error: null, session: data.session };
  } catch (error: any) {
    console.error("Sign in error:", error.message);
    return { error: new Error(error.message) };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ success: boolean, error: Error | null }> => {
  try {
    console.log("Signing out user");
    const session = getStoredSession();
    
    if (session) {
      // Call the logout endpoint
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.id}`
        }
      });
    }
    
    // Clear the local session regardless of API call result
    clearSession();
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Sign out error:", error.message);
    
    // Still clear the session even if API call fails
    clearSession();
    
    return { success: false, error: new Error(error.message) };
  }
};

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
        'Authorization': `Bearer ${session.user.id}`
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
