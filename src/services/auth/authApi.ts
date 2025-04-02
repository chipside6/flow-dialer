import { toast } from "@/components/ui/use-toast";
import { User, Session, API_URL } from './types';
import { storeSession, clearSession, getStoredSession } from './session';

// Sign up a new user with enhanced error handling and timeout management
export const signUp = async (email: string, password: string): Promise<{ error: Error | null, session?: Session }> => {
  try {
    console.log("Signing up new user:", email);
    console.log("Making signup request to:", `${API_URL}/auth/signup`);
    
    // Add more detailed error logging and better network error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      }),
      // Ensure correct CORS options
      mode: 'cors',
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("Signup response status:", response.status);
    
    if (!response.ok) {
      let errorMessage: string;
      
      try {
        // Try to parse error as JSON
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Server responded with status: ${response.status}`;
      } catch {
        // Fallback to text if not JSON
        const errorText = await response.text();
        errorMessage = errorText || `Server responded with status: ${response.status}`;
      }
      
      console.error("Signup failed:", response.status, errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log("Signup successful, received data:", data);
    
    // Check if session data is returned on signup
    if (data.session) {
      console.log("Session data received, storing session");
      // Store the session
      storeSession(data.session);
      return { error: null, session: data.session };
    }
    
    return { error: null };
  } catch (error: any) {
    console.error("Sign up error:", error);
    
    // Provide more helpful error messages based on error type
    if (error.name === 'AbortError') {
      return { error: new Error('Network request timed out. Please check your internet connection and try again.') };
    } else if (error.message === 'Failed to fetch') {
      return { error: new Error('Could not connect to the server. Please make sure you have an internet connection and the backend server is running.') };
    }
    
    return { error: new Error(error.message || 'Network error occurred during signup') };
  }
};

// Sign in an existing user with enhanced error handling
export const signIn = async (email: string, password: string): Promise<{ error: Error | null, session?: Session }> => {
  try {
    console.log("Signing in user:", email);
    console.log("Making login request to:", `${API_URL}/auth/login`);
    
    // Add timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      }),
      // Ensure correct CORS options
      mode: 'cors',
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("Login response status:", response.status);
    
    if (!response.ok) {
      let errorMessage: string;
      
      try {
        // Try to parse error as JSON
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Invalid login credentials (${response.status})`;
      } catch {
        // Fallback to text if not JSON
        const errorText = await response.text();
        errorMessage = errorText || `Invalid login credentials (${response.status})`;
      }
      
      console.error("Login failed:", response.status, errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log("Login successful, received data:", data);
    
    if (!data.session) {
      throw new Error('Invalid response format from server - no session data');
    }
    
    // Store the session
    storeSession(data.session);
    
    return { error: null, session: data.session };
  } catch (error: any) {
    console.error("Sign in error:", error);
    
    // Provide more helpful error messages based on error type
    if (error.name === 'AbortError') {
      return { error: new Error('Network request timed out. Please check your internet connection and try again.') };
    } else if (error.message === 'Failed to fetch') {
      return { error: new Error('Could not connect to the server. Please make sure you have an internet connection and the backend server is running.') };
    }
    
    return { error: new Error(error.message || 'Network error occurred during login') };
  }
};

// Sign out the current user with enhanced reliability and cleanup
export const signOut = async (): Promise<{ success: boolean, error: Error | null }> => {
  try {
    console.log("Signing out user");
    const session = getStoredSession();
    
    // Create a flag to track overall success
    let apiCallSucceeded = true;
    let apiErrorMessage = '';
    
    if (session) {
      console.log("Making logout request to:", `${API_URL}/auth/logout`);
      try {
        // Call the logout endpoint with a timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token || ''}`
          },
          mode: 'cors',
          credentials: 'same-origin',
          signal: controller.signal
        }).catch(err => {
          // Ignore network errors during logout, just log them
          console.warn("Network error during API logout:", err);
          apiCallSucceeded = false;
          apiErrorMessage = err.message;
          return null;
        });
        
        clearTimeout(timeoutId);
        
        // Check for non-200 response
        if (response && !response.ok) {
          apiCallSucceeded = false;
          console.warn("Logout warning: Server returned", response.status);
          const errorText = await response.text().catch(e => "Could not read error response");
          apiErrorMessage = errorText;
          console.warn("Warning details:", errorText);
        }
      } catch (apiError: any) {
        // Log but continue with local logout even if API call fails
        console.warn("API logout failed, continuing with local logout:", apiError);
        apiCallSucceeded = false;
        apiErrorMessage = apiError.message;
      }
    }
    
    // Always clear the local session regardless of API call result
    clearSession();
    
    // Now aggressively clear ALL session-related data
    try {
      // Clear all local storage items that might contain auth data
      for (const key of Object.keys(localStorage)) {
        if (key.includes('auth') || key.includes('session') || key.includes('token') || 
            key.includes('user') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      }
      
      // Clear session storage too in case it's being used
      for (const key of Object.keys(sessionStorage)) {
        if (key.includes('auth') || key.includes('session') || key.includes('token') || 
            key.includes('user') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      }
      
      // Clear any cookies related to authentication
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name.includes('auth') || name.includes('session') || name.includes('token') || 
            name.includes('user') || name.includes('supabase')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    } catch (clearError) {
      console.warn("Error during aggressive cleanup:", clearError);
    }
    
    // Log the outcome for debugging
    if (!apiCallSucceeded) {
      console.log(`Logout completed with API warnings: ${apiErrorMessage}, but local session was cleared`);
    } else {
      console.log("Logout completed successfully");
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Sign out error:", error.message);
    
    // Still clear the session even if API call fails
    clearSession();
    
    // Attempt aggressive cleanup here too
    try {
      // Clear local storage
      localStorage.clear();
      // Clear session storage
      sessionStorage.clear();
    } catch (e) {
      console.warn("Error during emergency cleanup:", e);
    }
    
    // Return success true even on error since we cleared the session
    return { success: true, error: null };
  }
};

export * from './profileApi';
