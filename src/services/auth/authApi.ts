import { toast } from "@/components/ui/use-toast";
import { User, Session, API_URL } from './types';
import { storeSession, clearSession, getStoredSession } from './session';

// Sign up a new user
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
      const errorData = await response.text();
      console.error("Signup failed:", response.status, errorData);
      throw new Error(errorData || `Server responded with status: ${response.status}`);
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
      return { error: new Error('Could not connect to the server. Please make sure the backend server is running at http://localhost:5000.') };
    }
    
    return { error: new Error(error.message || 'Network error occurred during signup') };
  }
};

// Sign in an existing user
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
      const errorData = await response.text();
      console.error("Login failed:", response.status, errorData);
      throw new Error(errorData || `Invalid login credentials (${response.status})`);
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
      return { error: new Error('Could not connect to the server. Please make sure the backend server is running at http://localhost:5000.') };
    }
    
    return { error: new Error(error.message || 'Network error occurred during login') };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ success: boolean, error: Error | null }> => {
  try {
    console.log("Signing out user");
    const session = getStoredSession();
    
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
          return null;
        });
        
        clearTimeout(timeoutId);
        
        // Check for non-200 response
        if (response && !response.ok) {
          console.warn("Logout warning: Server returned", response.status);
          const errorText = await response.text().catch(e => "Could not read error response");
          console.warn("Warning details:", errorText);
        }
      } catch (apiError) {
        // Log but continue with local logout even if API call fails
        console.warn("API logout failed, continuing with local logout:", apiError);
      }
    }
    
    // Always clear the local session regardless of API call result
    clearSession();
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Sign out error:", error.message);
    
    // Still clear the session even if API call fails
    clearSession();
    
    // Return success true even on error since we cleared the session
    return { success: true, error: null };
  }
};
